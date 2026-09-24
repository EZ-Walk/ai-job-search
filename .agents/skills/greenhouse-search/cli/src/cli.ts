#!/usr/bin/env bun
// Self-contained CLI for searching Greenhouse's public job-board API (US market).
// No external CLI framework and zero runtime dependencies, so it runs anywhere
// `bun` is available with nothing installed beyond the repo clone.
//
// Greenhouse is org-scoped: there is no global search. This CLI fans out across a
// configured list of board tokens (see ORG_SLUGS in src/helpers.ts), merges their
// boards, and filters for US roles client-side. Edit that list to add employers.

import { runSearch, ORG_SLUGS, type SearchOpts } from "./commands/search.js"
import { runDetail, type DetailOpts } from "./commands/detail.js"

interface Flags {
  _: string[]
  [k: string]: string | boolean | string[]
}

// Short-flag aliases.
const ALIAS: Record<string, string> = { q: "query", l: "location", n: "limit" }

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith("-")) {
      ;(flags._ as string[]).push(a)
      continue
    }
    const name = a.replace(/^-+/, "")
    const key = ALIAS[name] ?? name
    const next = argv[i + 1]
    // A flag with no following value (or another flag next) is a boolean.
    let value: string | boolean = true
    if (next !== undefined && !next.startsWith("-")) {
      value = next
      i++
    }
    flags[key] = value
  }
  return flags
}

type FlagValue = string | boolean | string[] | undefined

/** A flag's string value, or undefined for a bare/absent flag. */
function stringFlag(raw: FlagValue): string | undefined {
  return typeof raw === "string" ? raw : undefined
}

/** Split a comma-separated value ("anthropic,figma") into a trimmed value list. */
function commaList(raw: FlagValue): string[] {
  if (typeof raw !== "string") return []
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

const HELP = `greenhouse-cli — search Greenhouse job boards for US-market jobs

Greenhouse is org-scoped (no global search): this CLI fans out over a configured
list of board tokens, merges their boards, and filters for US roles. Edit the list
in .agents/skills/greenhouse-search/cli/src/helpers.ts (ORG_SLUGS). A company is on
Greenhouse if its board is at https://boards-api.greenhouse.io/v1/boards/<token>/jobs.

USAGE
  bun run src/cli.ts search [-q "<keywords>"] [-l "<location>"] [--remote] [--org a,b] [--format json|table|plain]
  bun run src/cli.ts detail <url | <org> <id>> [--format json|plain]

SEARCH FLAGS
  --query, -q <text>     Keyword filter (title, department, description). Optional.
  --location, -l <text>  Substring filter over the job's location label (e.g. "New York").
  --remote               Keep only remote roles.
  --org <tokens>         Comma-separated board tokens to search (default: the seeded list).
  --limit, -n <n>        Max results after merge. Default 50.
  --format <fmt>         json (default) | table | plain.

DETAIL
  <url>                  A boards.greenhouse.io/<org>/jobs/<id> URL, OR
  <org> <id>             a board token followed by a numeric job id.

DEFAULT ORGS (${ORG_SLUGS.length})
  ${ORG_SLUGS.join(", ")}

EXAMPLES
  bun run src/cli.ts search -q "engineer" --format table
  bun run src/cli.ts search -q "solutions" --remote --format table
  bun run src/cli.ts search --org anthropic,figma -l "New York" --format table
  bun run src/cli.ts detail https://boards.greenhouse.io/anthropic/jobs/4020159008 --format plain
  bun run src/cli.ts detail anthropic 4020159008 --format plain

Reads are public (no API key). Source: https://boards-api.greenhouse.io/v1/boards/<org>/jobs.
`

function parseIntFlag(name: string, raw: string | boolean | string[]): number | null {
  const val = parseInt(raw as string, 10)
  if (isNaN(val)) {
    process.stderr.write(JSON.stringify({ error: `--${name} must be a number, got "${raw}"`, code: "BAD_ARG" }) + "\n")
    return null
  }
  return val
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2)
  const flags = parseFlags(argv)
  const cmd = (flags._ as string[])[0]

  if (!cmd || flags.help || flags.h) {
    process.stdout.write(HELP)
    return cmd ? 0 : 1
  }

  if (cmd === "search") {
    const fmt = (flags.format as string) || "json"

    if (flags.limit !== undefined) {
      const v = parseIntFlag("limit", flags.limit)
      if (v === null) return 1
      flags.limit = String(v)
    }

    const orgs = commaList(flags.org)
    const opts: SearchOpts = {
      query: stringFlag(flags.query),
      location: stringFlag(flags.location),
      remoteOnly: flags.remote === true || flags.remote === "true",
      limit: flags.limit ? Math.max(1, parseInt(flags.limit as string, 10)) : 50,
      format: (["json", "table", "plain"].includes(fmt) ? fmt : "json") as SearchOpts["format"],
      orgs: orgs.length ? orgs : ORG_SLUGS,
    }
    return runSearch(opts)
  }

  if (cmd === "detail") {
    const rest = (flags._ as string[]).slice(1)
    if (rest.length === 0) {
      process.stderr.write(JSON.stringify({ error: "detail requires a <url> or <org> <id>", code: "NO_ID" }) + "\n")
      return 1
    }
    // Either `detail <url>` (one positional) or `detail <org> <id>` (two).
    const org = rest.length >= 2 ? rest[0] : undefined
    const id = rest.length >= 2 ? rest[1] : rest[0]
    const fmt = (flags.format as string) || "json"
    const opts: DetailOpts = { org, id, format: fmt === "plain" ? "plain" : "json" }
    return runDetail(opts)
  }

  process.stderr.write(JSON.stringify({ error: `Unknown command "${cmd}"`, code: "BAD_CMD" }) + "\n")
  return 1
}

main().then((code) => process.exit(code))
