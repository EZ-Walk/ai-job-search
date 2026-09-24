# Greenhouse board API reference

The endpoints, parameters, and response shapes this skill depends on. This is the
file to update if the Greenhouse API changes. There is no configurable base URL:
the public board API is always at `https://boards-api.greenhouse.io/v1/boards`.

## Authentication

None. The board API is public and unauthenticated for reads.

Verified against the live API:

| Endpoint | Status |
|----------|--------|
| `GET /v1/boards/<org>/jobs` | 200 (for a valid board token) |
| `GET /v1/boards/<org>/jobs?content=true` | 200 (adds content/departments/offices) |
| `GET /v1/boards/<org>/jobs/<id>` | 200 (single posting, always includes content) |
| `GET /v1/boards/<unknown-org>/jobs` | 404 |
| `GET /v1/boards//jobs` (no token) | 404 — **there is no global search** |

## Org-scoped model (no global search)

The API is **per-employer**. Each call returns exactly one company's board; there
is no cross-company search endpoint. The skill therefore keeps a list of board
tokens (`ORG_SLUGS` in `cli/src/helpers.ts`), fetches each board concurrently,
merges the results, and filters (US market + keyword/location/remote) client-side.

A company is on Greenhouse — and its token is usable here — if its board responds
at `https://boards-api.greenhouse.io/v1/boards/<token>/jobs`. The `<token>` is
usually the company name lowercased, sometimes suffixed (`saildroneinc`,
`togetherai`).

## `GET /v1/boards/<org>/jobs`

Returns one org's board:

```jsonc
{ "jobs": [ /* job objects */ ], "meta": { "total": 523 } }
```

Optional query param:

| Param | Notes |
|-------|-------|
| `content=true` | Inlines each job's `content` (HTML), `departments`, and `offices`. The default list OMITS all three. `search` requests it (so keyword matching sees the description); a bare list would only expose the title + location. |

### Job object (the fields the skill reads)

```jsonc
{
  "id": 7954688,                                  // numeric -> result.id (as a string), detail's <id>
  "internal_job_id": 3453698,
  "title": "Account Executive, AI Sales",
  "updated_at": "2026-07-13T14:37:36-04:00",      // fallback for result.date
  "first_published": "2026-06-02T08:58:57-04:00", // -> result.date (preferred, nullable)
  "requisition_id": "See Opening ID",
  "company_name": "Stripe",                        // -> result.company (falls back to the org token)
  "location": { "name": "San Francisco, CA" },     // free-text label -> result.location, US + --location filter
  "absolute_url": "https://stripe.com/jobs/search?gh_jid=7954688", // -> result.url (employer-hosted; varies)
  // present only with ?content=true or on the per-job endpoint:
  "content": "&lt;h2&gt;Who we are&lt;/h2&gt;…",   // entity-escaped HTML -> detail.description
  "departments": [{ "name": "Sales", "id": 380786, "parent_id": 85336, "child_ids": [] }],
  "offices": [{ "name": "US", "location": null, "id": 65234, "child_ids": [/*…*/] }]
}
```

Any of the nullable fields may be absent; the skill maps a missing value to `null`
and never omits a contract field.

## `GET /v1/boards/<org>/jobs/<id>` (per-job detail)

Unlike Ashby, Greenhouse **has** a per-job endpoint. It returns one job object
(the shape above) with `content`, `departments`, and `offices` always populated,
so `detail` fetches exactly one posting instead of scanning the whole board.

A public posting URL is `https://boards.greenhouse.io/<org>/jobs/<id>` (also
`job-boards.greenhouse.io/<org>/jobs/<id>`). The `detail` command accepts that URL,
a `?gh_jid=<id>` apply URL (plus the org, since that URL omits it), or an
`<org> <id>` pair.

## US-market filter (heuristic — no structured country)

Greenhouse exposes **no structured country and no remote flag**, so the filter
reads the free-text `location.name` plus the (unreliable) `offices[]`:

- **Location tokens** are split on `;` and `|`. A token is US if it has a `, ST`
  state code (50 states + DC) or a US word (`United States` / `USA` / `US`, matched
  on word boundaries so `Houston` / `Austin` don't false-positive).
- **Offices** corroborate: a US office name (`United States of America`, `US`,
  `NA`, `Federal`) keeps the job. Offices are used only to ADD keeps — they are
  frequently empty or broader than the posting, so they never drop a job.
- **Remote** is detected by the word `Remote` in a location token. A remote token
  whose remainder is empty (`"Remote"`) or an unrecognised place
  (`"Remote: SF Bay Area"`) is kept as potentially-US; a remote token pinned to a
  known non-US country/metro (`"Remote, India"`, `"Remote, London"`) is dropped.

A foreign non-remote role, or a remote role pinned abroad, is dropped. The
non-US place list in `cli/src/helpers.ts` (`NON_US_PLACE_RE`) is not exhaustive —
extend it if foreign remote roles leak through.

## Parsing notes

- The response is JSON, so there is no HTML card parsing (unlike the scraping
  portals). The `content` field is HTML with entities **double-escaped**
  (`&lt;p&gt;`); `cleanContent` decodes once to recover real HTML, then
  `cleanHtml` strips + decodes it a second time into prose.
- The `id` is a **number** on the wire; the skill renders it as a string in
  results so the contract shape matches the other portal skills.
- Fetch uses a descriptive User-Agent, `Accept: application/json`, and exponential
  backoff with jitter on 429/5xx (max 6 retries). A connection error (API
  unreachable) fails fast with a clear message. A `404` for a board is mapped to
  "no board" (skipped in `search`, `NOT_FOUND` in `detail`); a `404` for a job id
  is `NOT_FOUND` in `detail`.
