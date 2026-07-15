import {
  fetchBoard,
  normalizeJobRef,
  toDetail,
  writeError,
  type JobDetailResult,
} from "../helpers.js"

export interface DetailOpts {
  org?: string // org slug (optional when a full posting URL is given)
  id: string // a job UUID or a jobs.ashbyhq.com/<org>/<uuid> URL
  format: "json" | "plain"
}

/** A human-readable rendering of one job: header, present fields, description. */
function renderPlain(job: JobDetailResult): string {
  const lines = [
    job.title,
    `${job.company ?? "—"} · ${job.location ?? "—"}`,
    job.date ? `Posted: ${job.date.slice(0, 10)}` : "",
    job.department ? `Department: ${job.department}` : "",
    job.team ? `Team: ${job.team}` : "",
    job.employment_type ? `Employment: ${job.employment_type}` : "",
    job.work_mode ? `Workplace: ${job.work_mode}` : "",
    job.remote ? "Remote: yes" : "",
    "",
    job.description || "(no description)",
    "",
    `URL: ${job.url}`,
    job.apply_url ? `Apply: ${job.apply_url}` : "",
    `id: ${job.org}/${job.id}`,
  ].filter((l) => l !== "")
  return lines.join("\n")
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const ref = normalizeJobRef(opts.org, opts.id)
  if (!ref) {
    writeError(
      `could not parse an Ashby <org> + <uuid> from "${opts.id}" (pass a jobs.ashbyhq.com/<org>/<uuid> URL, or an org slug plus a job UUID)`,
      "BAD_ID",
    )
    return 1
  }
  try {
    // Ashby has no per-job endpoint: fetch the org's board and select by UUID.
    const board = await fetchBoard(ref.org, true)
    if (!board) {
      writeError(`no Ashby board for org "${ref.org}"`, "NOT_FOUND")
      return 1
    }
    const match = board.jobs.find((j) => j.id === ref.id)
    if (!match) {
      writeError(`job "${ref.id}" not found on org "${ref.org}"`, "NOT_FOUND")
      return 1
    }
    const job = toDetail(ref.org, match)

    if (opts.format === "plain") {
      process.stdout.write(renderPlain(job) + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
