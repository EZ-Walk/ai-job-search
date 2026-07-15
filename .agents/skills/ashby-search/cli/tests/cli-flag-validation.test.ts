import { describe, test, expect } from "bun:test";
import { runCLI } from "./helpers";

// These assert on validation error codes / help output that are emitted BEFORE
// any network call, so the suite is network-free.

function parsedStderr(stderr: string): { error?: string; code?: string } {
  try {
    return JSON.parse(stderr);
  } catch {
    return {};
  }
}

describe("ashby CLI flag validation", () => {
  describe("numeric flag validation", () => {
    test("--limit non-numeric exits 1 with BAD_ARG", async () => {
      const result = await runCLI(["search", "--limit", "foo"]);
      expect(result.exitCode).not.toBe(0);
      const err = parsedStderr(result.stderr);
      expect(err.code).toBe("BAD_ARG");
      expect(err.error).toMatch(/limit/);
    });
  });

  describe("detail argument validation", () => {
    test("missing id exits 1 with NO_ID", async () => {
      const result = await runCLI(["detail"]);
      expect(result.exitCode).not.toBe(0);
      expect(parsedStderr(result.stderr).code).toBe("NO_ID");
    });

    test("a bare UUID without an org exits 1 with BAD_ID (no network)", async () => {
      const result = await runCLI(["detail", "05e14247-17c4-4e98-9a13-53828a4e2f13"]);
      expect(result.exitCode).not.toBe(0);
      expect(parsedStderr(result.stderr).code).toBe("BAD_ID");
    });

    test("an unparseable id exits 1 with BAD_ID (no network)", async () => {
      const result = await runCLI(["detail", "not-a-uuid"]);
      expect(result.exitCode).not.toBe(0);
      expect(parsedStderr(result.stderr).code).toBe("BAD_ID");
    });
  });

  describe("command dispatch", () => {
    test("unknown command exits 1 with BAD_CMD", async () => {
      const result = await runCLI(["frobnicate"]);
      expect(result.exitCode).not.toBe(0);
      expect(parsedStderr(result.stderr).code).toBe("BAD_CMD");
    });

    test("no command prints help and exits 1", async () => {
      const result = await runCLI([]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toMatch(/USAGE/);
    });

    test("help lists the default orgs", async () => {
      const result = await runCLI(["--help"]);
      expect(result.stdout).toMatch(/DEFAULT ORGS/);
      expect(result.stdout).toMatch(/notion/);
    });
  });
});
