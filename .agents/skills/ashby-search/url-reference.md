# Ashby posting API reference

The endpoints, parameters, and response shapes this skill depends on. This is the
file to update if the Ashby API changes. There is no configurable base URL: the
public posting API is always at `https://api.ashbyhq.com/posting-api/job-board`.

## Authentication

None. The posting API is public and unauthenticated for reads.

Verified against the live API:

| Endpoint | Status |
|----------|--------|
| `GET /posting-api/job-board/<org>` | 200 (for a valid org with a board) |
| `GET /posting-api/job-board/<org>?includeCompensation=true` | 200 |
| `GET /posting-api/job-board/<unknown-org>` | 404 |
| `GET /posting-api/job-board` (no org) | 401 — **there is no global search** |

## Org-scoped model (no global search)

The API is **per-employer**. Each call returns exactly one company's board; there
is no cross-company search endpoint. The skill therefore keeps a list of org slugs
(`ORG_SLUGS` in `cli/src/helpers.ts`), fetches each board concurrently, merges the
results, and filters (US market + keyword/location/remote) client-side.

A company is on Ashby — and its slug is usable here — if its public careers page is
`https://jobs.ashbyhq.com/<slug>`. The `<slug>` is that path segment.

## `GET /posting-api/job-board/<org>`

Returns one org's board:

```jsonc
{ "apiVersion": 1, "jobs": [ /* job objects */ ] }
```

Optional query param:

| Param | Notes |
|-------|-------|
| `includeCompensation=true` | Adds a `compensation` object per job (populated only for some employers/jurisdictions). `detail` requests it; `search` does not. |

### Job object (the fields the skill reads)

```jsonc
{
  "id": "05e14247-17c4-4e98-9a13-53828a4e2f13", // UUID -> result.id, detail's <uuid>
  "title": "Outbound Business Development Representative, AMER",
  "department": "Early Career",                 // -> result.department
  "team": "Early Career",
  "employmentType": "FullTime",
  "location": "New York, New York",             // free-text label -> result.location, --location filter
  "secondaryLocations": [],
  "publishedAt": "2026-04-02T21:00:55.755+00:00", // -> result.date (nullable)
  "isRemote": true,                             // used for US + --remote filtering
  "workplaceType": "Hybrid",                    // "Hybrid" | "Remote" | "OnSite" -> result.work_mode
  "address": {
    "postalAddress": {
      "addressCountry": "United States",        // structured country -> US filter
      "addressRegion": "New York",
      "addressLocality": "New York"
    }
  },
  "descriptionHtml": "<div>…</div>",            // fallback for detail's description
  "descriptionPlain": "WHO WE ARE\n\n…",        // -> detail.description (preferred)
  "jobUrl": "https://jobs.ashbyhq.com/notion/05e14247-…",  // -> result.url
  "applyUrl": "https://jobs.ashbyhq.com/notion/05e14247-…/application" // -> detail.apply_url
}
```

Any of the nullable fields (`department`, `location`, `publishedAt`,
`workplaceType`, `isRemote`, `address`) may be absent; the skill maps a missing
value to `null` and never omits a contract field.

## Detail (no separate endpoint)

There is **no per-job detail endpoint**. To fetch one job's full detail, the skill
fetches that org's board (`?includeCompensation=true`) and selects the posting by
its `id` UUID. A public posting URL is `https://jobs.ashbyhq.com/<org>/<uuid>` —
the `detail` command accepts that URL, or an `<org> <uuid>` pair.

## US-market filter

A posting is kept if:

- `address.postalAddress.addressCountry` ∈ {United States, USA, US} (case-insensitive), **or**
- it is remote (`isRemote === true` or `workplaceType === "Remote"`) with a US or
  **unspecified** country.

A foreign non-remote role, or a remote role pinned to a non-US country, is dropped.

## Parsing notes

- The response is JSON, so there is no HTML card parsing (unlike the scraping
  portals). Ashby usually provides `descriptionPlain` directly; when only
  `descriptionHtml` is present, the skill strips it via `cleanHtml` in
  `cli/src/helpers.ts`.
- Fetch uses a descriptive User-Agent, `Accept: application/json`, and exponential
  backoff with jitter on 429/5xx (max 6 retries). A connection error (API
  unreachable) fails fast with a clear message. A `404`/`401` for an org is mapped
  to "no board" (skipped in `search`, `NOT_FOUND` in `detail`).
