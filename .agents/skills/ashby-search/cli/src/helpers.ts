// Data source: Ashby's public job-board API (JSON). Reads are unauthenticated —
// no API key, the same bar as linkedin-search / freehire-search — so there is no
// markup to parse: we fetch JSON and reshape it into the portal-skill contract's
// result fields.
//
// Ashby is ORG-SCOPED. There is no global search endpoint: you fetch one
// employer's board at a time (`/posting-api/job-board/<orgSlug>`) and filter
// client-side. This skill therefore fans out across a configured list of org
// slugs, merges the boards, and filters for the US market locally.

// ---------------------------------------------------------------------------
// ORG SLUG CONFIG — edit this list to add or remove employers.
//
// A company uses Ashby (and can be added here) if its careers page is at
// `https://jobs.ashbyhq.com/<slug>`. The <slug> is the path segment. Verify a
// candidate returns a non-empty board before adding it:
//   curl -s "https://api.ashbyhq.com/posting-api/job-board/<slug>" | head -c 200
// A 404 means the org is not on Ashby (or the slug is wrong); an empty
// `"jobs": []` means the board is live but currently has no open roles.
//
// Only verified-working, non-empty boards are seeded below.
// ---------------------------------------------------------------------------
// All slugs below were verified live (HTTP 200, non-empty board) against the
// Ashby posting API at seeding time. Some slugs contain a dot (e.g. "patch.io") —
// that is the literal board slug in the URL path and is handled fine.
export const ORG_SLUGS: string[] = [
  // outdoor / active / wearables / robotics
  "skydio", // San Mateo — GTM/Solutions Eng, RevOps
  "strava", // SF — ML/data + marketing
  "whoop", // Boston — wearables/ML
  "eightsleep", // NY+SF — sleep hardware, BDR/BD
  "tonal", // SF — connected fitness
  "rothys", // SF — sustainable footwear
  "pano-ai", // SF — wildfire CV, enterprise sales
  "bedrockocean", // Palo Alto — ocean mapping
  "zydro", // marine autonomy

  // climate / ocean / conservation
  "patch.io", // SF — carbon API (note the dot in the slug)
  "sofarocean", // SF — ocean data
  "watershed", // SF — climate
  "chestnut", // afforestation
  "mast", // reforestation
  "sylvera", // London — carbon ratings

  // ai / eng (broad coverage)
  "notion",
  "linear",
  "ramp",
  "openai",
  "cursor", // Anysphere's board (jobs.ashbyhq.com/cursor)
  "replit",
  "perplexity",
  "cohere",
]

// NOTE on outdoor/travel candidates that are NOT on Ashby (boards 404): AllTrails,
// Backroads, Hipcamp, Saildrone, The North Face / VF Corp. They use other ATSes —
// reach them via a different portal skill, not this one.

const BASE_URL = "https://api.ashbyhq.com/posting-api/job-board"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA = "ashby-search-skill/1.0 (+https://jobs.ashbyhq.com)"

/** The board response for one org: `{ jobs: [...], apiVersion }`. */
export interface Board {
  jobs: AshbyJob[]
  apiVersion?: number
}

/**
 * An Ashby job posting — the fields this skill reads (the wire shape carries
 * more). `address.postalAddress` is the structured location used for US
 * filtering; `location` is the free-text label.
 */
export interface AshbyJob {
  id: string
  title: string
  department?: string | null
  team?: string | null
  employmentType?: string | null
  location?: string | null
  secondaryLocations?: Array<{ location?: string | null }>
  publishedAt?: string | null
  isRemote?: boolean | null
  workplaceType?: string | null // "Hybrid" | "Remote" | "OnSite"
  address?: {
    postalAddress?: {
      addressCountry?: string | null
      addressRegion?: string | null
      addressLocality?: string | null
    }
  } | null
  descriptionHtml?: string | null
  descriptionPlain?: string | null
  jobUrl?: string | null
  applyUrl?: string | null
}

/**
 * A search result in the portal-skill contract shape. `id` is Ashby's job UUID;
 * `org` pairs with it to look the job up again via `detail`. Missing values are
 * `null`, never omitted. The extra fields are a permitted superset.
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
  team: string | null
  employment_type: string | null
  apply_url: string | null
  description: string | null
}

/**
 * GET one org's board. Retries 429/5xx (transient server states) with backoff;
 * returns `null` on a 404 (org not on Ashby / bad slug) so the fan-out can skip
 * it. A connection failure fails fast with a clear message — no retry, so an
 * outage degrades this source quickly rather than hanging the caller.
 */
export async function fetchBoard(org: string, includeCompensation = false): Promise<Board | null> {
  const qs = includeCompensation ? "?includeCompensation=true" : ""
  const url = `${BASE_URL}/${encodeURIComponent(org)}${qs}`
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
        `could not reach the Ashby API at ${BASE_URL} (${e instanceof Error ? e.message : String(e)})`,
      )
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Ashby API request failed for "${org}": ${response.status} ${response.statusText}`)
      }
      await sleep(delay + Math.floor(Math.random() * 500))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    // 404 (unknown org) and 401 (no org given) are treated as "no board".
    if (response.status === 404 || response.status === 401) return null

    const body = (await response.json().catch(() => null)) as Board | null
    if (!response.ok) {
      throw new Error(`Ashby API request failed for "${org}": ${response.status} ${response.statusText}`)
    }
    if (!body || !Array.isArray(body.jobs)) {
      throw new Error(`Ashby API returned an unparseable board for "${org}"`)
    }
    return body
  }
  throw new Error(`Ashby API request failed for "${org}" after retries`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

const US_COUNTRIES = new Set(["united states", "united states of america", "usa", "us", "u.s.", "u.s.a."])

function isRemote(j: AshbyJob): boolean {
  return j.isRemote === true || (j.workplaceType ?? "").toLowerCase() === "remote"
}

/**
 * US-market predicate. Keep a job if its structured country is the United
 * States, OR it is remote with a US or unspecified region (a remote role that
 * never pinned a country is treated as potentially US, not silently dropped).
 */
export function isUsJob(j: AshbyJob): boolean {
  const country = (j.address?.postalAddress?.addressCountry ?? "").trim().toLowerCase()
  if (country && US_COUNTRIES.has(country)) return true
  if (isRemote(j)) {
    // Remote: allow when the country is a US country or unspecified.
    if (!country) return true
    if (US_COUNTRIES.has(country)) return true
  }
  return false
}

/** Case-insensitive keyword match against title, department, team, and description. */
export function matchesQuery(j: AshbyJob, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [j.title, j.department, j.team, j.descriptionPlain]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

/** The public posting URL for a job, falling back to the canonical shape. */
function postingUrl(org: string, j: AshbyJob): string {
  return j.jobUrl || `https://jobs.ashbyhq.com/${org}/${j.id}`
}

/** Reshape an Ashby job into the contract search-result fields. */
export function toResult(org: string, j: AshbyJob): JobResult {
  return {
    id: j.id,
    org,
    title: j.title || "(untitled)",
    company: org,
    department: j.department || null,
    location: j.location || null,
    date: j.publishedAt || null,
    url: postingUrl(org, j),
    work_mode: j.workplaceType || null,
    remote: isRemote(j),
  }
}

/** Reshape an Ashby job into the detail result (adds the plain-text description). */
export function toDetail(org: string, j: AshbyJob): JobDetailResult {
  return {
    ...toResult(org, j),
    team: j.team || null,
    employment_type: j.employmentType || null,
    apply_url: j.applyUrl || null,
    description: j.descriptionPlain || cleanHtml(j.descriptionHtml),
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
 * Strip an Ashby description's HTML into readable prose: block/line-break tags
 * become newlines, entities are decoded, tags removed. Null for empty input.
 * (Ashby usually gives us `descriptionPlain` directly; this is the fallback.)
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
 * Parse a `jobs.ashbyhq.com/<org>/<uuid>` URL (or an `<org> <uuid>` pair) into
 * its org slug and job UUID. Returns null when neither is resolvable.
 */
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

export function normalizeJobRef(org: string | undefined, id: string): { org: string; id: string } | null {
  const trimmed = id.trim()
  if (!trimmed) return null
  // A full posting URL carries both the org and the UUID.
  const url = trimmed.match(new RegExp(`ashbyhq\\.com/([^/?#]+)/(${UUID_RE.source})`, "i"))
  if (url) return { org: url[1], id: url[2] }
  // A bare UUID needs an org from the positional arg.
  const bare = trimmed.match(new RegExp(`^${UUID_RE.source}$`, "i"))
  if (bare && org) return { org, id: trimmed }
  return null
}
