import { describe, test, expect } from "bun:test";
import {
  cleanHtml,
  cleanContent,
  isUsJob,
  isRemote,
  matchesQuery,
  normalizeJobRef,
  toResult,
  toDetail,
  type GreenhouseJob,
  type Board,
} from "../src/helpers";
import boardFixture from "./fixtures/greenhouse-board.json";

// A trimmed board sample (two Acme postings): one US/California, one Ireland.
// Used to exercise normalization + US filtering offline.
const board = boardFixture as unknown as Board;

function job(overrides: Partial<GreenhouseJob> = {}): GreenhouseJob {
  return {
    id: 4020159008,
    internal_job_id: 5030159008,
    title: "Backend Engineer",
    updated_at: "2026-04-02T21:00:55-04:00",
    first_published: "2026-04-01T09:00:00-04:00",
    requisition_id: "REQ-100",
    company_name: "Acme",
    location: { name: "San Francisco, CA" },
    absolute_url: "https://boards.greenhouse.io/acme/jobs/4020159008",
    content: "&lt;div&gt;&lt;p&gt;Build APIs.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Ship &amp;amp; iterate&lt;/li&gt;&lt;/ul&gt;&lt;/div&gt;",
    departments: [{ name: "Engineering" }],
    offices: [{ name: "United States of America" }],
    ...overrides,
  };
}

describe("toResult — reshape into the portal-skill contract", () => {
  test("renders the numeric id as a string and maps org/company/date", () => {
    const r = toResult("acme", job());
    expect(r.id).toBe("4020159008");
    expect(r.org).toBe("acme");
    expect(r.company).toBe("Acme");
    // date prefers first_published over updated_at
    expect(r.date).toBe("2026-04-01T09:00:00-04:00");
  });

  test("carries the required contract fields", () => {
    const r = toResult("acme", job());
    expect(r).toMatchObject({
      title: "Backend Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      remote: false,
      work_mode: null,
      url: "https://boards.greenhouse.io/acme/jobs/4020159008",
    });
  });

  test("company falls back to the org token; url falls back to the canonical board URL", () => {
    const r = toResult("acme", job({ company_name: null, absolute_url: null }));
    expect(r.company).toBe("acme");
    expect(r.url).toBe("https://boards.greenhouse.io/acme/jobs/4020159008");
  });

  test("a remote location sets remote + work_mode", () => {
    const r = toResult("acme", job({ location: { name: "Remote, US" } }));
    expect(r.remote).toBe(true);
    expect(r.work_mode).toBe("Remote");
  });

  test("missing department/location/date map to null, not omitted", () => {
    const r = toResult("acme", job({ departments: null, location: null, first_published: null, updated_at: null }));
    expect(r.department).toBeNull();
    expect(r.location).toBeNull();
    expect(r.date).toBeNull();
  });
});

describe("toDetail — adds the double-decoded description", () => {
  test("decodes Greenhouse's double-escaped content into prose", () => {
    const d = toDetail("acme", job());
    expect(d.description).toBe("Build APIs.\nShip & iterate");
    expect(d.apply_url).toBe("https://boards.greenhouse.io/acme/jobs/4020159008");
  });
});

describe("isUsJob — US-market filtering (free-text heuristic)", () => {
  test("keeps a 'City, ST' state code", () => {
    expect(isUsJob(job({ location: { name: "San Francisco, CA" }, offices: null }))).toBe(true);
    expect(isUsJob(job({ location: { name: "Austin, TX" }, offices: null }))).toBe(true);
  });

  test("does not mistake an embedded 'us' (Houston/Austin) for the US word", () => {
    // No state code, no offices, not remote — must be dropped despite the "us" substring.
    expect(isUsJob(job({ location: { name: "Houston" }, offices: null }))).toBe(false);
  });

  test("keeps an explicit US / USA / United States word", () => {
    expect(isUsJob(job({ location: { name: "Remote, US" }, offices: null }))).toBe(true);
    expect(isUsJob(job({ location: { name: "Remote, USA" }, offices: null }))).toBe(true);
    expect(isUsJob(job({ location: { name: "Anywhere, United States" }, offices: null }))).toBe(true);
  });

  test("keeps a job whose offices[] name is a US country token, even with a vague location", () => {
    expect(isUsJob(job({ location: { name: "Multiple Locations" }, offices: [{ name: "United States of America" }] }))).toBe(true);
    expect(isUsJob(job({ location: { name: "Multiple Locations" }, offices: [{ name: "NA" }] }))).toBe(true);
  });

  test("drops a foreign, non-remote job", () => {
    expect(isUsJob(job({ location: { name: "Dublin, Ireland" }, offices: [{ name: "Ireland" }] }))).toBe(false);
  });

  test("keeps a remote job with an unspecified country", () => {
    expect(isUsJob(job({ location: { name: "Remote" }, offices: null }))).toBe(true);
  });

  test("keeps a remote job pinned to a US region that lacks a state code", () => {
    // The false-negative class that a pure state-code check would miss.
    expect(isUsJob(job({ location: { name: "Remote: San Francisco Bay Area" }, offices: null }))).toBe(true);
  });

  test("drops a remote job pinned to a non-US country or metro", () => {
    expect(isUsJob(job({ location: { name: "Remote, India" }, offices: null }))).toBe(false);
    expect(isUsJob(job({ location: { name: "Remote, United Kingdom" }, offices: null }))).toBe(false);
    expect(isUsJob(job({ location: { name: "Remote, Bangalore" }, offices: null }))).toBe(false);
  });

  test("keeps a multi-location posting when ANY location is US", () => {
    expect(isUsJob(job({ location: { name: "Remote, Canada; Remote, United Kingdom; Remote, US" }, offices: null }))).toBe(true);
  });

  test("handles the ' | ' separator Greenhouse also uses", () => {
    expect(isUsJob(job({ location: { name: "San Francisco, CA | New York, NY" }, offices: null }))).toBe(true);
    // Mixed: a US region (no state code) alongside a foreign metro — kept via the US part.
    expect(isUsJob(job({ location: { name: "Remote: SF Bay Area | Remote, London" }, offices: null }))).toBe(true);
    // Purely foreign multi-location — dropped.
    expect(isUsJob(job({ location: { name: "London | Berlin" }, offices: null }))).toBe(false);
  });

  test("US-filters the captured board down to the one US posting", () => {
    const kept = board.jobs.filter(isUsJob);
    expect(kept).toHaveLength(1);
    expect(kept[0].location?.name).toBe("San Francisco, CA");
  });
});

describe("isRemote", () => {
  test("detects remote from the location label", () => {
    expect(isRemote(job({ location: { name: "Remote, US" } }))).toBe(true);
    expect(isRemote(job({ location: { name: "San Francisco, CA" } }))).toBe(false);
  });
});

describe("matchesQuery — keyword filter", () => {
  test("matches against title, department, and decoded content, case-insensitively", () => {
    expect(matchesQuery(job(), "backend")).toBe(true);
    expect(matchesQuery(job(), "ENGINEERING")).toBe(true);
    expect(matchesQuery(job(), "iterate")).toBe(true); // lives in the escaped content
    expect(matchesQuery(job(), "nonexistent-term")).toBe(false);
  });
  test("an empty query matches everything", () => {
    expect(matchesQuery(job(), "")).toBe(true);
  });
});

describe("normalizeJobRef — resolve org + id", () => {
  const id = "4020159008";
  test("parses a boards.greenhouse.io URL", () => {
    expect(normalizeJobRef(undefined, `https://boards.greenhouse.io/anthropic/jobs/${id}`)).toEqual({ org: "anthropic", id });
  });
  test("parses a job-boards.greenhouse.io URL", () => {
    expect(normalizeJobRef(undefined, `https://job-boards.greenhouse.io/anthropic/jobs/${id}`)).toEqual({ org: "anthropic", id });
  });
  test("parses a gh_jid apply URL given an org arg", () => {
    expect(normalizeJobRef("stripe", `https://stripe.com/jobs/search?gh_jid=${id}`)).toEqual({ org: "stripe", id });
  });
  test("accepts a bare numeric id plus an org arg", () => {
    expect(normalizeJobRef("anthropic", id)).toEqual({ org: "anthropic", id });
  });
  test("rejects a bare id without an org", () => {
    expect(normalizeJobRef(undefined, id)).toBeNull();
  });
  test("rejects a non-numeric id", () => {
    expect(normalizeJobRef("anthropic", "not-an-id")).toBeNull();
    expect(normalizeJobRef("anthropic", "")).toBeNull();
  });
});

describe("cleanContent / cleanHtml", () => {
  test("cleanContent double-decodes escaped HTML", () => {
    expect(cleanContent("&lt;p&gt;One&lt;/p&gt;&lt;p&gt;Two&lt;/p&gt;")).toBe("One\nTwo");
    // A literal ampersand in the text is double-escaped on the wire (&amp;amp;).
    expect(cleanContent("&lt;p&gt;A &amp;amp; B&lt;/p&gt;")).toBe("A & B");
  });
  test("cleanHtml preserves paragraph breaks and decodes entities", () => {
    expect(cleanHtml("<p>One</p><p>Two</p>")).toBe("One\nTwo");
    expect(cleanHtml("Caf&#xE9;")).toBe("Café");
  });
  test("returns null for empty input", () => {
    expect(cleanContent("")).toBeNull();
    expect(cleanContent(null)).toBeNull();
    expect(cleanHtml("")).toBeNull();
  });
});
