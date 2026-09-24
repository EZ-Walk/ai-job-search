import { afterEach, describe, expect, test } from "bun:test";
import { runSearch } from "../src/commands/search";
import { runDetail } from "../src/commands/detail";
import type { GreenhouseJob, Board } from "../src/helpers";

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

/**
 * Mock fetch that routes by URL: `/jobs/<id>` returns a single job, `/jobs`
 * (list, with or without ?content=true) returns the board. `status` applies to
 * whichever endpoint is hit.
 */
function mockApi(status: number, board: Partial<Board>): void {
  globalThis.fetch = (async (url: string | URL) => {
    const u = typeof url === "string" ? url : url.toString();
    const isSingle = /\/jobs\/\d+/.test(u);
    const payload = isSingle ? (board.jobs?.[0] ?? {}) : board;
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

function job(overrides: Partial<GreenhouseJob> = {}): GreenhouseJob {
  return {
    id: 4020159008,
    title: "Backend Engineer",
    updated_at: "2026-04-02T21:00:55-04:00",
    first_published: "2026-04-01T09:00:00-04:00",
    company_name: "Acme",
    location: { name: "San Francisco, CA" },
    absolute_url: "https://boards.greenhouse.io/acme/jobs/4020159008",
    content: "&lt;p&gt;Build APIs.&lt;/p&gt;",
    departments: [{ name: "Engineering" }],
    offices: [{ name: "United States of America" }],
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
  orgs: ["acme"],
};

describe("runSearch (mocked fetch)", () => {
  test("emits the contract envelope and keeps only US jobs", async () => {
    const foreign = job({ id: 999, title: "Dublin Engineer", location: { name: "Dublin, Ireland" }, offices: [{ name: "Ireland" }] });
    mockApi(200, { meta: { total: 2 }, jobs: [job(), foreign] });
    const out = captureStdout();

    const code = await runSearch({ ...searchOpts, query: "backend" });
    expect(code).toBe(0);

    const parsed = JSON.parse(out.get());
    expect(parsed.meta).toMatchObject({ count: 1, total: 1, orgs: 1 });
    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].id).toBe("4020159008");
    expect(parsed.results[0].org).toBe("acme");
  });

  test("a keyword that matches nothing yields an empty results array", async () => {
    mockApi(200, { meta: { total: 1 }, jobs: [job()] });
    const out = captureStdout();

    const code = await runSearch({ ...searchOpts, query: "nothing-matches-xyz" });
    expect(code).toBe(0);
    expect(JSON.parse(out.get()).results).toHaveLength(0);
  });

  test("--remote keeps only remote roles", async () => {
    const onsite = job({ id: 111, location: { name: "New York, NY" } });
    const remote = job({ id: 222, location: { name: "Remote, US" } });
    mockApi(200, { meta: { total: 2 }, jobs: [onsite, remote] });
    const out = captureStdout();

    const code = await runSearch({ ...searchOpts, remoteOnly: true });
    expect(code).toBe(0);
    const parsed = JSON.parse(out.get());
    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].id).toBe("222");
  });

  test("a 404 org board is skipped, not fatal", async () => {
    mockApi(404, {});
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
  test("fetches the per-job endpoint and prints its detail", async () => {
    mockApi(200, { jobs: [job()] });
    const out = captureStdout();

    const code = await runDetail({ org: "acme", id: "4020159008", format: "json" });
    expect(code).toBe(0);

    const parsed = JSON.parse(out.get());
    expect(parsed.id).toBe("4020159008");
    expect(parsed.description).toBe("Build APIs.");
    expect(parsed.apply_url).toBe("https://boards.greenhouse.io/acme/jobs/4020159008");
  });

  test("a 404 job exits 1 with NOT_FOUND", async () => {
    mockApi(404, {});
    const err = captureStderr();
    const code = await runDetail({ org: "acme", id: "555", format: "json" });
    expect(code).toBe(1);
    expect(JSON.parse(err.get()).code).toBe("NOT_FOUND");
  });
});
