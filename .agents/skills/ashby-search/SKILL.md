---
name: ashby-search
version: 1.0.0
description: >
  Use this skill to search live US job listings posted on Ashby job boards, or to
  look up a specific Ashby posting. Ashby is a modern ATS used by many AI, eng, and
  data companies (Notion, OpenAI, Ramp, Linear, Cohere, Perplexity, …); a company
  is on Ashby if its careers page is at jobs.ashbyhq.com/<slug>. Because Ashby has
  NO global search (each board is one employer), this skill fans out over a
  configured list of org slugs, merges their boards, and filters for the US market.
  Trigger phrases: find a job at an Ashby company, jobs at Notion/OpenAI/Ramp/etc,
  startup jobs, AI company jobs, "are there any <role> jobs at <Ashby company>",
  look up this jobs.ashbyhq.com posting.
context: fork
allowed-tools: Bash(bun run .agents/skills/ashby-search/cli/src/cli.ts *)
---

# Ashby Search Skill

Search live job listings from **[Ashby](https://www.ashbyhq.com)** job boards —
Ashby is a modern applicant-tracking system whose public posting API serves each
employer's open roles as JSON. No authentication, no API key, and **zero runtime
dependencies** — it runs with just `bun`.

> This is a US-market worked example of the repo's job-portal-skill pattern, like
> `linkedin-search` and `freehire-search`. Unlike the HTML-scraping portals, it
> queries Ashby's public JSON API, so results are structured (title, department,
> workplace type, structured country) rather than parsed from markup.

## ⚠️ Ashby is org-scoped — there is no global search

Ashby's API is **per-employer**. The endpoint is
`GET https://api.ashbyhq.com/posting-api/job-board/<orgSlug>`; calling it with no
org (`/posting-api/job-board`) returns 401. There is **no cross-company search**.

So this skill keeps an editable list of **org slugs** and, on each `search`, it:

1. fetches every configured org's board concurrently,
2. merges the postings,
3. **filters for the US market** (see below),
4. applies your keyword / location / remote filters client-side.

The seeded org list lives at the top of
[`cli/src/helpers.ts`](cli/src/helpers.ts) as the `ORG_SLUGS` constant, grouped by
category. **Edit that list to add or remove employers** (see "Extending the org
list" below).

## US-market filtering

A posting is kept when **either**:

- its structured country (`address.postalAddress.addressCountry`) is the United
  States (`"United States"`, `"USA"`, `"US"`, case-insensitive), **or**
- it is remote (`isRemote === true` or `workplaceType === "Remote"`) with a US or
  **unspecified** country — a remote role that never pinned a country is treated
  as potentially-US rather than silently dropped.

Everything else (a foreign, non-remote role; a remote role pinned to a non-US
country) is filtered out.

## ℹ️ Hosted-service dependency

This skill reads Ashby's **public, unauthenticated** posting API — the same
zero-signup bar as `linkedin-search`. If a board is unreachable the CLI fails
gracefully: a non-zero exit with a clear error on stderr. An org slug that 404s
(not on Ashby / wrong slug) is simply skipped during a fan-out, so one bad slug
never breaks the whole search.

## When to use this skill

- Search US openings across a curated set of Ashby companies by keyword
- Filter to remote roles, or to a location substring (e.g. "New York")
- Restrict to specific companies with `--org`
- Get the full description of a specific Ashby posting (for `/apply`)

## Commands

### Search job listings

```bash
bun run .agents/skills/ashby-search/cli/src/cli.ts search [-q "<keywords>"] [-l "<location>"] [--remote] [--org a,b] [--format json|table|plain]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword filter over title, department, team, and description. Optional.
- `--location <text>` / `-l <text>` — substring filter over the job's free-text location label, e.g. `-l "New York"`.
- `--remote` — keep only remote roles.
- `--org <slugs>` — comma-separated org slugs to search instead of the seeded list, e.g. `--org notion,linear`.
- `--limit <n>` / `-n <n>` — max results after merge. Default 50.
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run .agents/skills/ashby-search/cli/src/cli.ts detail <url | <org> <uuid>> [--format json|plain]
```

Ashby has **no per-job endpoint** — `detail` fetches the org's board and selects
the job by UUID. Pass **either**:
- a full posting URL: `https://jobs.ashbyhq.com/<org>/<uuid>`, or
- an org slug followed by the job UUID: `notion 05e14247-…`.

The `id` in a `search` result is the UUID and `org` is the slug, so
`detail <org> <id>` round-trips a search result. Returns the plain-text
description plus department, team, employment type, workplace type, and the
`apply_url` (what `/apply` opens).

## Usage examples

```bash
# US engineering roles across the seeded companies, table view
bun run .agents/skills/ashby-search/cli/src/cli.ts search -q "engineer" --format table

# Remote data roles only
bun run .agents/skills/ashby-search/cli/src/cli.ts search -q "data" --remote --format table

# Roles at Notion + Linear in New York
bun run .agents/skills/ashby-search/cli/src/cli.ts search --org notion,linear -l "New York" --format table

# Full details for one posting (from a search result's org + id)
bun run .agents/skills/ashby-search/cli/src/cli.ts detail notion 05e14247-17c4-4e98-9a13-53828a4e2f13 --format plain

# ...or by pasting the posting URL
bun run .agents/skills/ashby-search/cli/src/cli.ts detail https://jobs.ashbyhq.com/notion/05e14247-17c4-4e98-9a13-53828a4e2f13 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use; each result carries `org` + `id` to pass to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

Search JSON is `{ "meta": { "count", "total", "orgs" }, "results": [...] }`; each
result carries at least `id` (the job UUID), `org` (the company slug), `title`,
`company`, `location`, `date`, `url`, `work_mode`, and `remote` (missing values are
`null`). All errors are written to **stderr** as `{ "error": "...", "code": "..." }`
and the process exits with code `1`.

## Extending the org list

The default companies are seeded in `ORG_SLUGS` at the top of
[`cli/src/helpers.ts`](cli/src/helpers.ts), commented by category
(`// outdoor & travel`, `// ai / eng / data`). To add a company:

1. Confirm it uses Ashby: its careers page URL is `https://jobs.ashbyhq.com/<slug>`.
   The `<slug>` is that path segment.
2. Verify the board is live and non-empty:
   ```bash
   curl -s "https://api.ashbyhq.com/posting-api/job-board/<slug>" | head -c 200
   ```
   A `404` means the org is not on Ashby (or the slug is wrong); `"jobs": []`
   means the board exists but has no open roles right now.
3. Add the verified slug to `ORG_SLUGS` (under the right category comment).

You can also search an ad-hoc set without editing the file, via `--org a,b,c`.

> **Note on coverage.** Many outdoor / travel employers (AllTrails, Backroads,
> Hipcamp, Saildrone, The North Face / VF Corp) were checked and are **not on
> Ashby** — their boards 404. They use other ATSes, so they cannot be added here;
> reach them via a different portal skill. The seeded companies are AI / eng / data
> shops that do run on Ashby.

## Notes

- Data is from Ashby's public posting API — no credentials required. This skill is
  **search + detail only**.
- `date` is the posting date (`publishedAt`); it may be `null`.
- Results are merged newest-first and capped by `--limit` after the merge.
- The API retries 429/5xx with exponential backoff; an unreachable API exits
  non-zero with a clear message.
- Add `?includeCompensation=true` support is used by `detail` under the hood; the
  `compensation` object is only populated for some employers/jurisdictions, so this
  skill does not surface it as a first-class field.
