// Data source: Greenhouse's public job-board API (JSON). Reads are unauthenticated —
// no API key, the same bar as ashby-search / linkedin-search — so there is no
// markup to parse: we fetch JSON and reshape it into the portal-skill contract's
// result fields.
//
// Greenhouse is ORG-SCOPED. There is no global search endpoint: you fetch one
// employer's board at a time (`/v1/boards/<token>/jobs`) and filter client-side.
// This skill therefore fans out across a configured list of board tokens, merges
// the boards, and filters for the US market locally.
//
// Two ways Greenhouse differs from Ashby, and how this skill handles them:
//   1. No structured country and no remote flag. A posting's only location signal
//      is the free-text `location.name` ("San Francisco, CA", "Remote, US",
//      "Remote, India"), plus a sometimes-present, often-unreliable `offices[]`.
//      US filtering is therefore a heuristic over those strings (see isUsJob).
//   2. `content` is HTML with its entities double-escaped ("&lt;p&gt;"). We decode
//      once to recover real HTML, then strip it (see cleanContent).
// Greenhouse DOES expose a real per-job endpoint (`/jobs/<id>`), so — unlike Ashby
// — `detail` fetches exactly one posting instead of the whole board.

// ---------------------------------------------------------------------------
// BOARD TOKEN CONFIG — edit this list to add or remove employers.
//
// A company uses Greenhouse (and can be added here) if its board is served at
// `https://boards-api.greenhouse.io/v1/boards/<token>/jobs`. The <token> is the
// path segment (often the company name lowercased, sometimes suffixed, e.g.
// "saildroneinc", "togetherai"). Verify a candidate returns a non-empty board
// before adding it:
//   curl -s "https://boards-api.greenhouse.io/v1/boards/<token>/jobs" | head -c 200
// A 404 means the org is not on Greenhouse (or the token is wrong); a
// `"jobs": []` with `meta.total: 0` means the board is live but currently empty.
//
// Only verified-working, non-empty boards are seeded below (checked live at
// seeding time), grouped by fit to the candidate's target sectors.
// ---------------------------------------------------------------------------
export const ORG_SLUGS: string[] = [
  // outdoor / active / climate / ocean (see documents/outdoor-target-companies.md)
  "saildroneinc", // Alameda — uncrewed ocean vehicles, ML SWE
  "onxmaps", // Missoula — backcountry ski/hike/climb nav, data/ML + growth
  "carbonrobotics", // Seattle — LaserWeeder CV robot
  "overstory", // remote-US — satellite wildfire risk for utilities (climate)
  "peakdesign", // SF — outdoor/photography gear
  "muonspace", // Mountain View — climate-monitoring satellites

  // ai-native / eng / data (AI Solutions/GTM/Forward-Deployed + data roles)
  "anthropic",
  "databricks",
  "scaleai",
  "togetherai", // Together AI — the board token is "togetherai"
  "samsara", // physical-operations IoT / connected fleet
  "verkada",
  "figma",

  // fintech / broad GTM + data (wider net)
  "coinbase",
  "robinhood",
  "affirm",
  "brex",
  "airtable",
]

// NOTE on outdoor/travel candidates that are NOT on Greenhouse (boards 404):
// AllTrails, Allbirds, Patagonia, REI, Komoot. They use other ATSes — reach them
// via a different portal skill, not this one. (Watershed runs on Ashby, not here —
// see ashby-search — so it is intentionally omitted to avoid a duplicate source.)

const BASE_URL = "https://boards-api.greenhouse.io/v1/boards"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA = "greenhouse-search-skill/1.0 (+https://boards.greenhouse.io)"

/** The board response for one org: `{ jobs: [...], meta: { total } }`. */
export interface Board {
  jobs: GreenhouseJob[]
  meta?: { total?: number }
}

/**
 * A Greenhouse job posting — the fields this skill reads (the wire shape carries
 * more). `location.name` is the free-text label used for US filtering; `content`
 * (present with `?content=true` and on the per-job endpoint) is entity-escaped
 * HTML. `departments`/`offices` are also content-only.
 */
export interface GreenhouseJob {
  id: number
  internal_job_id?: number | null
  title: string
  updated_at?: string | null
  first_published?: string | null
  requisition_id?: string | null
  company_name?: string | null
  location?: { name?: string | null } | null
  absolute_url?: string | null
  content?: string | null // entity-escaped HTML (content=true / detail only)
  departments?: Array<{ name?: string | null }> | null // content-only
  offices?: Array<{ name?: string | null }> | null // content-only
  metadata?: unknown
}

/**
 * A search result in the portal-skill contract shape. `id` is Greenhouse's numeric
 * job id rendered as a string; `org` pairs with it to look the job up again via
 * `detail`. Missing values are `null`, never omitted. The extra fields are a
 * permitted superset.
 */
export interface JobResult {
  id: string
  org: string
  title: string
  company: string | null
  department: string | null
  location: string | null
  date: string | null
  url: string
  work_mode: string | null
  remote: boolean
}

/** A job detail: the search result plus the plain-text description. */
export interface JobDetailResult extends JobResult {
  employment_type: string | null // Greenhouse rarely exposes this; carried for contract parity
  apply_url: string | null
  description: string | null
}

/**
 * GET one org's board (optionally with `?content=true`, which inlines each job's
 * HTML content, departments, and offices). Retries 429/5xx (transient server
 * states) with backoff; returns `null` on a 404 (org not on Greenhouse / bad
 * token) so the fan-out can skip it. A connection failure fails fast with a clear
 * message — no retry, so an outage degrades this source quickly rather than
 * hanging the caller.
 */
export async function fetchBoard(org: string, includeContent = false): Promise<Board | null> {
  const qs = includeContent ? "?content=true" : ""
  const url = `${BASE_URL}/${encodeURIComponent(org)}/jobs${qs}`
  const body = await fetchJson(url, org)
  if (body === null) return null
  if (!body || !Array.isArray((body as Board).jobs)) {
    throw new Error(`Greenhouse API returned an unparseable board for "${org}"`)
  }
  return body as Board
}

/**
 * GET a single posting via Greenhouse's per-job endpoint
 * (`/v1/boards/<org>/jobs/<id>`), which always includes `content`. Returns `null`
 * when the org or the job id is a 404.
 */
export async function fetchJob(org: string, id: string): Promise<GreenhouseJob | null> {
  const url = `${BASE_URL}/${encodeURIComponent(org)}/jobs/${encodeURIComponent(id)}`
  const body = await fetchJson(url, org)
  if (body === null) return null
  if (!body || typeof (body as GreenhouseJob).id === "undefined") {
    throw new Error(`Greenhouse API returned an unparseable job for "${org}/${id}"`)
  }
  return body as GreenhouseJob
}

/**
 * Shared fetch with retry/backoff. Returns the parsed JSON, or `null` for a
 * 404 (not-found — the caller decides whether that is "skip" or "not found").
 */
async function fetchJson(url: string, org: string): Promise<unknown | null> {
  const maxRetries = 6
  let delay = 500

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let response: Response
    try {
      response = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        redirect: "follow",
      })
    } catch (e) {
      throw new Error(
        `could not reach the Greenhouse API at ${BASE_URL} (${e instanceof Error ? e.message : String(e)})`,
      )
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Greenhouse API request failed for "${org}": ${response.status} ${response.statusText}`)
      }
      await sleep(delay + Math.floor(Math.random() * 500))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    // 404 (unknown org or unknown job id) is treated as "not found".
    if (response.status === 404) return null

    const parsed = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(`Greenhouse API request failed for "${org}": ${response.status} ${response.statusText}`)
    }
    if (parsed === null) {
      throw new Error(`Greenhouse API returned an unparseable response for "${org}"`)
    }
    return parsed
  }
  throw new Error(`Greenhouse API request failed for "${org}" after retries`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// --- US-market heuristic ----------------------------------------------------
// Greenhouse gives no structured country, so we read the free-text location
// label. The philosophy mirrors ashby-search: an explicitly-US posting is kept,
// an explicitly-foreign one is dropped, and an ambiguous *remote* posting is
// treated as potentially-US (kept) rather than silently dropped.

// 50 states + DC, matched only in a "City, ST" tail so we don't mistake a random
// two-letter substring for a state code.
const US_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY", "DC",
])

// Explicit US country tokens. `\bus\b` is safe against "Houston"/"Austin" because
// those embed "us" mid-word (no word boundary), while "Remote, US" stands alone.
const US_WORD_RE = /\b(united states of america|united states|u\.s\.a\.|u\.s\.|usa|us)\b/i
// A "City, ST" tail (optionally trailed by ", USA" etc.). Captures the 2-letter code.
const US_STATE_RE = /,\s*([A-Za-z]{2})(?:\b|$)/g
// US office names on the (unreliable) offices[] array. "NA"/"North America" and
// "Federal" are US-inclusive for our purposes.
const US_OFFICE = new Set(["united states of america", "united states", "usa", "us", "na", "north america", "federal"])

// Known non-US places (countries + a few big non-US metros) used ONLY to reject a
// remote posting whose remainder clearly pins it abroad. Not exhaustive — an
// unrecognised remote remainder stays "potentially US" and is kept.
const NON_US_PLACE_RE = new RegExp(
  "\\b(" +
    [
      "canada", "united kingdom", "u\\.k\\.", "uk", "ireland", "germany", "france", "netherlands",
      "spain", "italy", "portugal", "poland", "sweden", "norway", "denmark", "finland", "switzerland",
      "austria", "belgium", "brazil", "mexico", "argentina", "colombia", "chile", "india", "china",
      "japan", "singapore", "australia", "new zealand", "israel", "united arab emirates", "uae",
      "south africa", "nigeria", "kenya", "egypt", "turkey", "ukraine", "romania", "czechia",
      "philippines", "indonesia", "vietnam", "thailand", "malaysia", "south korea", "hong kong",
      "taiwan", "emea", "apac", "latam", "europe", "asia",
      // big non-US metros that appear without a country
      "london", "berlin", "paris", "amsterdam", "dublin", "toronto", "vancouver", "bangalore",
      "bengaluru", "mumbai", "hyderabad", "tel aviv", "sydney", "melbourne", "tokyo", "singapore",
      "são paulo", "sao paulo", "mexico city", "barcelona", "madrid", "munich",
    ].join("|") +
    ")\\b",
  "i",
)

/**
 * Split a Greenhouse location label into its individual locations. Greenhouse
 * joins multiple locations with either ";" or " | " ("San Francisco, CA | New
 * York, NY"), so we split on both and evaluate each independently.
 */
function splitLocations(name: string): string[] {
  return name.split(/[;|]/).map((p) => p.trim()).filter(Boolean)
}

/** True if a single location token carries an explicit US signal. */
function tokenIsUs(token: string): boolean {
  if (US_WORD_RE.test(token)) return true
  US_STATE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = US_STATE_RE.exec(token)) !== null) {
    if (US_STATES.has(m[1].toUpperCase())) return true
  }
  return false
}

/** True if a token is a remote label ("Remote", "Remote, US", "Remote: SF Bay Area"). */
function tokenIsRemote(token: string): boolean {
  return /\bremote\b/i.test(token)
}

/**
 * US-market predicate over a posting's free-text location (a job may list several
 * locations joined by ";") plus its (optional) offices[]. Keep a job if:
 *   - any location token has an explicit US signal (state code or US word), OR
 *   - any office name is a US country token, OR
 *   - it is remote and its remainder does not clearly pin it to a non-US place
 *     (a bare "Remote", or "Remote: San Francisco Bay Area", is potentially-US).
 * A foreign non-remote role, or a remote role pinned abroad ("Remote, India"),
 * is dropped.
 */
export function isUsJob(j: GreenhouseJob): boolean {
  const name = j.location?.name ?? ""
  const parts = splitLocations(name)

  if (parts.some(tokenIsUs)) return true

  const offices = j.offices ?? []
  if (offices.some((o) => US_OFFICE.has((o?.name ?? "").trim().toLowerCase()))) return true

  for (const part of parts) {
    if (!tokenIsRemote(part)) continue
    // Strip the "remote" word (and surrounding punctuation) to inspect the remainder.
    const rest = part.replace(/remote/gi, "").replace(/[\s,:;()\-–—]+/g, " ").trim()
    if (rest === "") return true // bare "Remote" — unspecified, treat as potentially US
    if (!NON_US_PLACE_RE.test(rest)) return true // e.g. "San Francisco Bay Area" — not a known foreign place
  }
  return false
}

/** True if any of a posting's locations is a remote label. */
export function isRemote(j: GreenhouseJob): boolean {
  return splitLocations(j.location?.name ?? "").some((p) => tokenIsRemote(p))
}

/** Case-insensitive keyword match against title, department(s), and stripped content. */
export function matchesQuery(j: GreenhouseJob, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const departments = (j.departments ?? []).map((d) => d?.name ?? "").join(" ")
  const haystack = [j.title, departments, j.location?.name, cleanContent(j.content)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

/** The public posting URL for a job (the employer-facing `absolute_url`, or the canonical board URL). */
function postingUrl(org: string, j: GreenhouseJob): string {
  return j.absolute_url || `https://boards.greenhouse.io/${org}/jobs/${j.id}`
}

/** The first department name, or null. */
function primaryDepartment(j: GreenhouseJob): string | null {
  const name = (j.departments ?? []).map((d) => d?.name).find((n) => !!n)
  return name || null
}

/** Reshape a Greenhouse job into the contract search-result fields. */
export function toResult(org: string, j: GreenhouseJob): JobResult {
  const remote = isRemote(j)
  return {
    id: String(j.id),
    org,
    title: j.title || "(untitled)",
    company: j.company_name || org,
    department: primaryDepartment(j),
    location: j.location?.name || null,
    date: j.first_published || j.updated_at || null,
    url: postingUrl(org, j),
    work_mode: remote ? "Remote" : null, // Greenhouse gives no Hybrid/OnSite distinction
    remote,
  }
}

/** Reshape a Greenhouse job into the detail result (adds the plain-text description). */
export function toDetail(org: string, j: GreenhouseJob): JobDetailResult {
  return {
    ...toResult(org, j),
    employment_type: null, // not exposed by the Greenhouse board API
    apply_url: postingUrl(org, j),
    description: cleanContent(j.content),
  }
}

function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
}

/**
 * Strip an HTML description into readable prose: block/line-break tags become
 * newlines, entities are decoded, tags removed. Null for empty input.
 */
export function cleanHtml(html: string | null | undefined): string | null {
  if (!html) return null
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
  const text = decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  return text || null
}

/**
 * Greenhouse's `content` is HTML with its markup entities *double-escaped*
 * ("&lt;p&gt;Hi &amp;amp; bye&lt;/p&gt;"). Decoding once recovers real HTML
 * ("<p>Hi &amp; bye</p>"), which cleanHtml then strips and decodes a second time
 * ("Hi & bye"). Null for empty input.
 */
export function cleanContent(content: string | null | undefined): string | null {
  if (!content) return null
  return cleanHtml(decodeHtmlEntities(content))
}

/**
 * Parse a `boards.greenhouse.io/<org>/jobs/<id>` URL, a `?gh_jid=<id>` URL, or an
 * `<org> <id>` pair into an org token and numeric job id. A `gh_jid` URL carries
 * no org, so it requires the org positional arg. Returns null when neither is
 * resolvable.
 */
export function normalizeJobRef(org: string | undefined, id: string): { org: string; id: string } | null {
  const trimmed = id.trim()
  if (!trimmed) return null

  // A canonical Greenhouse board URL carries both the org token and the id:
  //   https://boards.greenhouse.io/<org>/jobs/<id>
  //   https://job-boards.greenhouse.io/<org>/jobs/<id>
  const boardUrl = trimmed.match(/greenhouse\.io\/([^/?#]+)\/jobs\/(\d+)/i)
  if (boardUrl) return { org: boardUrl[1], id: boardUrl[2] }

  // A `gh_jid=<id>` URL (an employer-hosted apply link) has the id but no org.
  const ghJid = trimmed.match(/[?&]gh_jid=(\d+)/i)
  if (ghJid && org) return { org, id: ghJid[1] }

  // A bare numeric id needs an org from the positional arg.
  if (/^\d+$/.test(trimmed) && org) return { org, id: trimmed }

  return null
}
