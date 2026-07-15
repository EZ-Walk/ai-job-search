import { afterEach, describe, expect, test } from "bun:test";
import { runSearch } from "../src/commands/search";
import { runDetail } from "../src/commands/detail";
import type { AshbyJob, Board } from "../src/helpers";

const originalFetch = globalThis.fetch;
const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

function captureStdout(): { get: () => string } {
  let buf = "";
  process.stdout.write = ((chunk: string | Uint8Array) => {
    buf += chunk.toString();
    return true;
  }) as typeof process.stdout.write;
  return { get: () => buf };
}

function captureStderr(): { get: () => string } {
  let buf = "";
  process.stderr.write = ((chunk: string | Uint8Array) => {
    buf += chunk.toString();
    return true;
  }) as typeof process.stderr.write;
  return { get: () => buf };
}

/** Mock fetch to serve one board (or a status) regardless of the org URL. */
function mockBoard(status: number, board: Partial<Board>): void {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(board), {
      status,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
}

function job(overrides: Partial<AshbyJob> = {}): AshbyJob {
  return {
    id: "05e14247-17c4-4e98-9a13-53828a4e2f13",
    title: "Backend Engineer",
    department: "Engineering",
    team: "Platform",
    employmentType: "FullTime",
    location: "New York, New York",
    secondaryLocations: [],
    publishedAt: "2026-04-02T21:00:55.755+00:00",
    isRemote: true,
    workplaceType: "Hybrid",
    address: { postalAddress: { addressCountry: "United States", addressRegion: "New York" } },
    descriptionPlain: "Build APIs.",
    jobUrl: "https://jobs.ashbyhq.com/notion/05e14247-17c4-4e98-9a13-53828a4e2f13",
    applyUrl: "https://jobs.ashbyhq.com/notion/05e14247-17c4-4e98-9a13-53828a4e2f13/application",
    ...overrides,
  };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
});

const searchOpts = {
  remoteOnly: false,
  limit: 50,
  format: "json" as const,
  orgs: ["notion"],
};

describe("runSearch (mocked fetch)", () => {
  test("emits the contract envelope and keeps only US jobs", async () => {
    const foreign = job({ id: "6ad34426-b980-436b-80c4-3634c00094ad", isRemote: null, workplaceType: null, address: { postalAddress: { addressCountry: "Ireland" } } });
    mockBoard(200, { apiVersion: 1, jobs: [job(), foreign] });
    const out = captureStdout();

    const code = await runSearch({ ...searchOpts, query: "backend" });
    expect(code).toBe(0);

    const parsed = JSON.parse(out.get());
    expect(parsed.meta).toMatchObject({ count: 1, total: 1, orgs: 1 });
    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].id).toBe("05e14247-17c4-4e98-9a13-53828a4e2f13");
    expect(parsed.results[0].org).toBe("notion");
  });

  test("a keyword that matches nothing yields an empty results array", async () => {
    mockBoard(200, { apiVersion: 1, jobs: [job()] });
    const out = captureStdout();

    const code = await runSearch({ ...searchOpts, query: "nothing-matches-xyz" });
    expect(code).toBe(0);
    expect(JSON.parse(out.get()).results).toHaveLength(0);
  });

  test("--remote keeps only remote roles", async () => {
    const hybrid = job({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", isRemote: false, workplaceType: "Hybrid" });
    const remote = job({ id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", isRemote: false, workplaceType: "Remote" });
    mockBoard(200, { apiVersion: 1, jobs: [hybrid, remote] });
    const out = captureStdout();

    const code = await runSearch({ ...searchOpts, remoteOnly: true });
    expect(code).toBe(0);
    const parsed = JSON.parse(out.get());
    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].id).toBe("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
  });

  test("a 404 org board is skipped, not fatal", async () => {
    mockBoard(404, {});
    const out = captureStdout();
    const code = await runSearch({ ...searchOpts });
    expect(code).toBe(0);
    expect(JSON.parse(out.get()).results).toHaveLength(0);
  });

  test("network failure exits 1 with SEARCH_FAILED", async () => {
    globalThis.fetch = (async () => {
      throw new Error("ECONNREFUSED");
    }) as typeof fetch;
    const err = captureStderr();
    const code = await runSearch({ ...searchOpts });
    expect(code).toBe(1);
    expect(JSON.parse(err.get()).code).toBe("SEARCH_FAILED");
  });
});

describe("runDetail (mocked fetch)", () => {
  test("selects the matching UUID from the board and prints its detail", async () => {
    mockBoard(200, { apiVersion: 1, jobs: [job()] });
    const out = captureStdout();

    const code = await runDetail({ org: "notion", id: "05e14247-17c4-4e98-9a13-53828a4e2f13", format: "json" });
    expect(code).toBe(0);

    const parsed = JSON.parse(out.get());
    expect(parsed.id).toBe("05e14247-17c4-4e98-9a13-53828a4e2f13");
    expect(parsed.description).toBe("Build APIs.");
    expect(parsed.apply_url).toBe("https://jobs.ashbyhq.com/notion/05e14247-17c4-4e98-9a13-53828a4e2f13/application");
  });

  test("a UUID absent from the board exits 1 with NOT_FOUND", async () => {
    mockBoard(200, { apiVersion: 1, jobs: [job()] });
    const err = captureStderr();
    const code = await runDetail({ org: "notion", id: "ffffffff-ffff-ffff-ffff-ffffffffffff", format: "json" });
    expect(code).toBe(1);
    expect(JSON.parse(err.get()).code).toBe("NOT_FOUND");
  });

  test("a 404 org exits 1 with NOT_FOUND", async () => {
    mockBoard(404, {});
    const err = captureStderr();
    const code = await runDetail({ org: "nope", id: "05e14247-17c4-4e98-9a13-53828a4e2f13", format: "json" });
    expect(code).toBe(1);
    expect(JSON.parse(err.get()).code).toBe("NOT_FOUND");
  });
});
