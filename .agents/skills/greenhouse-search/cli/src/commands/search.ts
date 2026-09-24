import {
  ORG_SLUGS,
  fetchBoard,
  isUsJob,
  isRemote,
  matchesQuery,
  toResult,
  writeError,
  type JobResult,
} from "../helpers.js"

export interface SearchOpts {
  query?: string
  location?: string // free-text substring filter over the job's location label
  remoteOnly: boolean // keep only remote roles
  limit: number
  format: "json" | "table" | "plain"
  orgs: string[] // the board tokens to fan out over (defaults to ORG_SLUGS)
}

/** The date portion (YYYY-MM-DD) of an ISO timestamp, or "—" when absent. */
function shortDate(date: string | null): string {
  return date ? date.slice(0, 10) : "—"
}

interface Column {
  header: string
  width: number
  cell: (r: JobResult) => string
}

function renderTable(rows: JobResult[]): string {
  if (rows.length === 0) return "No results."
  const columns: Column[] = [
    { header: "ID", width: Math.max(2, ...rows.map((r) => r.id.length)), cell: (r) => r.id },
    { header: "ORG", width: 14, cell: (r) => r.org },
    { header: "TITLE", width: 38, cell: (r) => r.title },
    { header: "LOCATION", width: 24, cell: (r) => r.location ?? "—" },
    { header: "MODE", width: 8, cell: (r) => (r.remote ? "remote" : (r.work_mode ?? "—")) },
    { header: "DATE", width: 10, cell: (r) => shortDate(r.date) },
  ]
  const row = (cells: string[]) => cells.map((c, i) => c.slice(0, columns[i].width).padEnd(columns[i].width)).join("  ")

  const header = row(columns.map((c) => c.header))
  const body = rows.map((r) => row(columns.map((c) => c.cell(r))))
  return [header, "-".repeat(header.length), ...body].join("\n")
}

function renderPlain(rows: JobResult[]): string {
  if (rows.length === 0) return "No results."
  const block = (r: JobResult) =>
    [
      r.title,
      `  ${r.company ?? "—"} · ${r.location ?? "—"} · ${shortDate(r.date)}`,
      `  ${r.org}/${r.id}`,
      `  ${r.url}`,
    ].join("\n")
  return rows.map(block).join("\n\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    // Fan out across the configured org boards concurrently, requesting content=true
    // so keyword search can see each job's department + description (Greenhouse's
    // default list omits them). An org that 404s (fetchBoard -> null) is skipped;
    // one unreachable/erroring org rejects the whole run (the graceful-degradation
    // contract fails the source loudly).
    const boards = await Promise.all(
      opts.orgs.map((org) => fetchBoard(org, true).then((b) => ({ org, board: b }))),
    )

    const rows: JobResult[] = []
    const loc = (opts.location ?? "").trim().toLowerCase()
    for (const { org, board } of boards) {
      if (!board) continue
      for (const j of board.jobs) {
        if (!isUsJob(j)) continue
        if (opts.remoteOnly && !isRemote(j)) continue
        if (opts.query && !matchesQuery(j, opts.query)) continue
        if (loc && !(j.location?.name ?? "").toLowerCase().includes(loc)) continue
        rows.push(toResult(org, j))
      }
    }

    // Newest first, then cap. A null date sorts last.
    rows.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    const capped = rows.slice(0, opts.limit)

    if (opts.format === "table") {
      process.stdout.write(renderTable(capped) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(renderPlain(capped) + "\n")
    } else {
      process.stdout.write(
        JSON.stringify(
          { meta: { count: capped.length, total: rows.length, orgs: opts.orgs.length }, results: capped },
          null,
          2,
        ) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}

/** The default org list, exported so the CLI/help can reference it. */
export { ORG_SLUGS }
