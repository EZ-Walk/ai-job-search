import {
  fetchJob,
  normalizeJobRef,
  toDetail,
  writeError,
  type JobDetailResult,
} from "../helpers.js"

export interface DetailOpts {
  org?: string // board token (optional when a full posting URL is given)
  id: string // a numeric job id or a boards.greenhouse.io/<org>/jobs/<id> URL
  format: "json" | "plain"
}

/** A human-readable rendering of one job: header, present fields, description. */
function renderPlain(job: JobDetailResult): string {
  const lines = [
    job.title,
    `${job.company ?? "—"} · ${job.location ?? "—"}`,
    job.date ? `Posted: ${job.date.slice(0, 10)}` : "",
    job.department ? `Department: ${job.department}` : "",
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
      `could not parse a Greenhouse <org> + <id> from "${opts.id}" (pass a boards.greenhouse.io/<org>/jobs/<id> URL, or an org token plus a numeric job id)`,
      "BAD_ID",
    )
    return 1
  }
  try {
    // Greenhouse has a real per-job endpoint, so fetch exactly this posting.
    const job = await fetchJob(ref.org, ref.id)
    if (!job) {
      writeError(`job "${ref.id}" not found on org "${ref.org}"`, "NOT_FOUND")
      return 1
    }
    const detail = toDetail(ref.org, job)

    if (opts.format === "plain") {
      process.stdout.write(renderPlain(detail) + "\n")
    } else {
      process.stdout.write(JSON.stringify(detail, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
