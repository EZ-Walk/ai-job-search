---
name: greenhouse-search
version: 1.0.0
description: >
  Use this skill to search live US job listings posted on Greenhouse job boards, or
  to look up a specific Greenhouse posting. Greenhouse is a widely-used ATS behind
  many tech, climate, outdoor, and fintech companies (Anthropic, Databricks, Figma,
  Saildrone, onX Maps, Overstory, Coinbase, …); a company is on Greenhouse if its
  board is served at boards-api.greenhouse.io/v1/boards/<token>. Because Greenhouse
  has NO global search (each board is one employer), this skill fans out over a
  configured list of board tokens, merges their boards, and filters for the US
  market. Trigger phrases: find a job at a Greenhouse company, jobs at
  Anthropic/Databricks/Saildrone/onX/etc, outdoor/climate company jobs, "are there
  any <role> jobs at <Greenhouse company>", look up this boards.greenhouse.io posting.
context: fork
allowed-tools: Bash(bun run .agents/skills/greenhouse-search/cli/src/cli.ts *)
---

# Greenhouse Search Skill

Search live job listings from **[Greenhouse](https://www.greenhouse.com)** job
boards — Greenhouse is an applicant-tracking system whose public board API serves
each employer's open roles as JSON. No authentication, no API key, and **zero
runtime dependencies** — it runs with just `bun`.

> This is a US-market worked example of the repo's job-portal-skill pattern, a
> sibling of `ashby-search`. Both query a public JSON API (not HTML), so results
> are structured. The key difference is that Greenhouse exposes **no structured
> country and no remote flag** — a posting's only location signal is a free-text
> label — so US filtering here is a heuristic over that text (see below).

## ⚠️ Greenhouse is org-scoped — there is no global search

Greenhouse's API is **per-employer**. The endpoint is
`GET https://boards-api.greenhouse.io/v1/boards/<token>/jobs`; there is **no
cross-company search** (a missing/empty token 404s).

So this skill keeps an editable list of **board tokens** and, on each `search`, it:

1. fetches every configured board concurrently (with `?content=true`, so keyword
   search can see each job's department and description),
2. merges the postings,
3. **filters for the US market** (see below),
4. applies your keyword / location / remote filters client-side.

The seeded token list lives at the top of
[`cli/src/helpers.ts`](cli/src/helpers.ts) as the `ORG_SLUGS` constant, grouped by
category. **Edit that list to add or remove employers** (see "Extending the org
list" below).

## US-market filtering (a heuristic, unlike Ashby)

Greenhouse has no structured country, so this skill reads the free-text
`location.name` (e.g. `"San Francisco, CA"`, `"Remote, US"`, `"Remote, India"`,
`"San Francisco, CA | New York, NY"`) plus the sometimes-present, often-unreliable
`offices[]` array. A posting is kept when **any** of:

- a location token carries an explicit US signal — a `, ST` state code (all 50 +
  DC) or a US word (`United States`, `USA`, `US`), **or**
- an `offices[]` entry names a US territory (`United States of America`, `US`,
  `NA`/North America, `Federal`), **or**
- it is **remote** and its remainder does not clearly pin it abroad — a bare
  `"Remote"`, or `"Remote: San Francisco Bay Area"`, is treated as
  potentially-US rather than silently dropped.

A foreign non-remote role, or a remote role pinned to a known non-US country or
metro (`"Remote, India"`, `"Remote, London"`), is filtered out. The heuristic is
deliberately permissive on ambiguous remote roles (a false positive is easy to
eyeball; a silently-dropped US role is a missed job) — the same philosophy as
`ashby-search`, adapted to messier input.

## ℹ️ Hosted-service dependency

This skill reads Greenhouse's **public, unauthenticated** board API — the same
zero-signup bar as `ashby-search`. If a board is unreachable the CLI fails
gracefully: a non-zero exit with a clear error on stderr. A board token that 404s
(not on Greenhouse / wrong token) is simply skipped during a fan-out, so one bad
token never breaks the whole search.

## When to use this skill

- Search US openings across a curated set of Greenhouse companies by keyword
- Filter to remote roles, or to a location substring (e.g. "New York")
- Restrict to specific companies with `--org`
- Get the full description of a specific Greenhouse posting (for `/apply`)

## Commands

### Search job listings

```bash
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search [-q "<keywords>"] [-l "<location>"] [--remote] [--org a,b] [--format json|table|plain]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword filter over title, department, and description. Optional.
- `--location <text>` / `-l <text>` — substring filter over the job's free-text location label, e.g. `-l "New York"`.
- `--remote` — keep only remote roles.
- `--org <tokens>` — comma-separated board tokens to search instead of the seeded list, e.g. `--org anthropic,figma`.
- `--limit <n>` / `-n <n>` — max results after merge. Default 50.
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run .agents/skills/greenhouse-search/cli/src/cli.ts detail <url | <org> <id>> [--format json|plain]
```

Unlike Ashby, Greenhouse has a **real per-job endpoint**
(`/v1/boards/<org>/jobs/<id>`), so `detail` fetches exactly one posting. Pass
**either**:
- a full posting URL: `https://boards.greenhouse.io/<org>/jobs/<id>` (or a
  `?gh_jid=<id>` apply URL together with the org), or
- an org token followed by the numeric job id: `anthropic 4020159008`.

The `id` in a `search` result is the numeric job id and `org` is the token, so
`detail <org> <id>` round-trips a search result. Returns the plain-text
description plus department, workplace, and the `apply_url` (what `/apply` opens).

## Usage examples

```bash
# US engineering roles across the seeded companies, table view
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search -q "engineer" --format table

# Remote solutions/GTM roles only
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search -q "solutions" --remote --format table

# Roles at Anthropic + Figma in New York
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search --org anthropic,figma -l "New York" --format table

# Full details for one posting (from a search result's org + id)
bun run .agents/skills/greenhouse-search/cli/src/cli.ts detail anthropic 4020159008 --format plain

# ...or by pasting the posting URL
bun run .agents/skills/greenhouse-search/cli/src/cli.ts detail https://boards.greenhouse.io/anthropic/jobs/4020159008 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use; each result carries `org` + `id` to pass to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

Search JSON is `{ "meta": { "count", "total", "orgs" }, "results": [...] }`; each
result carries at least `id` (the job id), `org` (the board token), `title`,
`company`, `location`, `date`, `url`, `work_mode`, and `remote` (missing values are
`null`). All errors are written to **stderr** as `{ "error": "...", "code": "..." }`
and the process exits with code `1`.

## Extending the org list

The default companies are seeded in `ORG_SLUGS` at the top of
[`cli/src/helpers.ts`](cli/src/helpers.ts), commented by category (`// outdoor /
active / climate / ocean`, `// ai-native / eng / data`, `// fintech / broad GTM +
data`). To add a company:

1. Confirm it uses Greenhouse: its board API responds at
   `https://boards-api.greenhouse.io/v1/boards/<token>/jobs`. The `<token>` is
   usually the company name lowercased, sometimes suffixed (`saildroneinc`,
   `togetherai`).
2. Verify the board is live and non-empty:
   ```bash
   curl -s "https://boards-api.greenhouse.io/v1/boards/<token>/jobs" | head -c 200
   ```
   A `404` means the org is not on Greenhouse (or the token is wrong); a
   `"meta": {"total": 0}` means the board exists but has no open roles right now.
3. Add the verified token to `ORG_SLUGS` (under the right category comment).

You can also search an ad-hoc set without editing the file, via `--org a,b,c`.

> **Note on coverage.** Several outdoor / travel employers (AllTrails, Allbirds,
> Patagonia, REI, Komoot) were checked and are **not on Greenhouse** — their boards
> 404. They use other ATSes. Watershed runs on **Ashby**, so it lives in
> `ashby-search`, not here, to avoid a duplicate source. The seeded companies are
> outdoor/climate/ocean, AI/eng/data, and fintech shops that do run on Greenhouse.

## Notes

- Data is from Greenhouse's public board API — no credentials required. This skill
  is **search + detail only**.
- `date` is the posting date (`first_published`, falling back to `updated_at`); it
  may be `null`.
- Results are merged newest-first and capped by `--limit` after the merge.
- The API retries 429/5xx with exponential backoff; an unreachable API exits
  non-zero with a clear message.
- Greenhouse's `content` field is HTML with its entities **double-escaped**
  (`&lt;p&gt;`); the skill decodes it twice into readable prose (`cleanContent` in
  `cli/src/helpers.ts`). Greenhouse does not expose a structured employment type,
  so that field is always `null`.
