import { describe, test, expect } from "bun:test";
import {
  cleanHtml,
  isUsJob,
  matchesQuery,
  normalizeJobRef,
  toResult,
  toDetail,
  type AshbyJob,
  type Board,
} from "../src/helpers";
import boardFixture from "./fixtures/notion-board.json";

// A captured real board sample (two Notion postings, trimmed): one US/Hybrid,
// one Ireland/OnSite. Used to exercise normalization + US filtering offline.
const board = boardFixture as unknown as Board;

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
    address: { postalAddress: { addressCountry: "United States", addressRegion: "New York", addressLocality: "New York" } },
    descriptionPlain: "Build APIs. Ship & iterate.",
    descriptionHtml: "<ul><li>Build APIs</li><li>Ship &amp; iterate</li></ul>",
    jobUrl: "https://jobs.ashbyhq.com/notion/05e14247-17c4-4e98-9a13-53828a4e2f13",
    applyUrl: "https://jobs.ashbyhq.com/notion/05e14247-17c4-4e98-9a13-53828a4e2f13/application",
    ...overrides,
  };
}

describe("toResult — reshape into the portal-skill contract", () => {
  test("maps id/org and publishedAt -> date", () => {
    const r = toResult("notion", job());
    expect(r.id).toBe("05e14247-17c4-4e98-9a13-53828a4e2f13");
    expect(r.org).toBe("notion");
    expect(r.company).toBe("notion");
    expect(r.date).toBe("2026-04-02T21:00:55.755+00:00");
  });

  test("carries the required contract fields", () => {
    const r = toResult("notion", job());
    expect(r).toMatchObject({
      title: "Backend Engineer",
      department: "Engineering",
      location: "New York, New York",
      work_mode: "Hybrid",
      remote: true,
      url: "https://jobs.ashbyhq.com/notion/05e14247-17c4-4e98-9a13-53828a4e2f13",
    });
  });

  test("missing values are null, not omitted; url falls back to the canonical shape", () => {
    const r = toResult("acme", job({ department: null, location: null, publishedAt: null, workplaceType: null, jobUrl: null, isRemote: false }));
    expect(r.department).toBeNull();
    expect(r.location).toBeNull();
    expect(r.date).toBeNull();
    expect(r.work_mode).toBeNull();
    expect(r.remote).toBe(false);
    expect(r.url).toBe("https://jobs.ashbyhq.com/acme/05e14247-17c4-4e98-9a13-53828a4e2f13");
  });
});

describe("toDetail — adds the plain-text description", () => {
  test("prefers descriptionPlain", () => {
    const d = toDetail("notion", job());
    expect(d.description).toBe("Build APIs. Ship & iterate.");
    expect(d.team).toBe("Platform");
    expect(d.employment_type).toBe("FullTime");
    expect(d.apply_url).toBe("https://jobs.ashbyhq.com/notion/05e14247-17c4-4e98-9a13-53828a4e2f13/application");
  });

  test("falls back to HTML-stripped description when plain is absent", () => {
    const d = toDetail("notion", job({ descriptionPlain: null }));
    expect(d.description).toBe("Build APIs\nShip & iterate");
  });
});

describe("isUsJob — US-market filtering", () => {
  test("keeps a United States country", () => {
    expect(isUsJob(job({ address: { postalAddress: { addressCountry: "United States" } } }))).toBe(true);
  });

  test("keeps USA / US variants case-insensitively", () => {
    expect(isUsJob(job({ isRemote: false, workplaceType: null, address: { postalAddress: { addressCountry: "USA" } } }))).toBe(true);
    expect(isUsJob(job({ isRemote: false, workplaceType: null, address: { postalAddress: { addressCountry: "us" } } }))).toBe(true);
  });

  test("drops a foreign, non-remote job", () => {
    const ie = job({ isRemote: null, workplaceType: null, address: { postalAddress: { addressCountry: "Ireland" } } });
    expect(isUsJob(ie)).toBe(false);
  });

  test("keeps a remote job with an unspecified country", () => {
    expect(isUsJob(job({ workplaceType: "Remote", isRemote: null, address: null }))).toBe(true);
  });

  test("drops a remote job pinned to a non-US country", () => {
    const ieRemote = job({ workplaceType: "Remote", isRemote: true, address: { postalAddress: { addressCountry: "Ireland" } } });
    expect(isUsJob(ieRemote)).toBe(false);
  });

  test("US-filters the captured board down to the one US posting", () => {
    const kept = board.jobs.filter(isUsJob);
    expect(kept).toHaveLength(1);
    expect(kept[0].address?.postalAddress?.addressCountry).toBe("United States");
  });
});

describe("matchesQuery — keyword filter", () => {
  test("matches against title/department/team/description, case-insensitively", () => {
    expect(matchesQuery(job(), "backend")).toBe(true);
    expect(matchesQuery(job(), "PLATFORM")).toBe(true);
    expect(matchesQuery(job(), "iterate")).toBe(true);
    expect(matchesQuery(job(), "nonexistent-term")).toBe(false);
  });
  test("an empty query matches everything", () => {
    expect(matchesQuery(job(), "")).toBe(true);
  });
});

describe("normalizeJobRef — resolve org + UUID", () => {
  const uuid = "05e14247-17c4-4e98-9a13-53828a4e2f13";
  test("parses a full posting URL", () => {
    expect(normalizeJobRef(undefined, `https://jobs.ashbyhq.com/notion/${uuid}`)).toEqual({ org: "notion", id: uuid });
  });
  test("accepts a bare UUID plus an org arg", () => {
    expect(normalizeJobRef("notion", uuid)).toEqual({ org: "notion", id: uuid });
  });
  test("rejects a bare UUID without an org", () => {
    expect(normalizeJobRef(undefined, uuid)).toBeNull();
  });
  test("rejects a non-UUID string", () => {
    expect(normalizeJobRef("notion", "not-a-uuid")).toBeNull();
    expect(normalizeJobRef("notion", "")).toBeNull();
  });
});

describe("cleanHtml", () => {
  test("preserves paragraph breaks between blocks", () => {
    expect(cleanHtml("<p>One</p><p>Two</p>")).toBe("One\nTwo");
  });
  test("decodes hex numeric entities", () => {
    expect(cleanHtml("Caf&#xE9;")).toBe("Café");
  });
  test("returns null for empty input", () => {
    expect(cleanHtml("")).toBeNull();
    expect(cleanHtml(null)).toBeNull();
  });
});
