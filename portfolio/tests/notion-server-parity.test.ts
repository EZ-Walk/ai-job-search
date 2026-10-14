/**
 * Integration test: first Published Blog Entries row (same order as /blog) vs live HTML.
 *
 * Requires .env.local with NOTION_TOKEN + blog data source id.
 * Starts `next dev` on port TEST_PORT (default 4876) unless TEST_BASE_URL is set.
 *
 * Optional: NOTION_PARITY_MIN_COVERAGE (default 0.65) — share of Notion body words found on page.
 */
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtendedRecordMap } from "notion-types";
import {
  getBlockTitle,
  getBlockValue,
  getPageContentBlockIds,
} from "notion-utils";
import { fetchPostBySlug, fetchPublishedPosts } from "../lib/notion/posts";
import { fetchRecordMap } from "../lib/notion/record-map";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portfolioRoot = path.join(__dirname, "..");

const DEFAULT_PORT = 4876;

function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractH1(html: string): string | null {
  const match = html.match(/<main[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) return null;
  return normalizeText(match[1].replace(/<[^>]+>/g, " "));
}

function extractSectionIntro(html: string): string | null {
  const match = html.match(/class="section-intro"[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return null;
  return normalizeText(match[1].replace(/<[^>]+>/g, " "));
}

function recordMapPlainText(recordMap: ExtendedRecordMap, pageId: string): string {
  const blockIds = getPageContentBlockIds(recordMap, pageId);
  const parts: string[] = [];
  for (const blockId of blockIds) {
    const block = getBlockValue(recordMap.block[blockId]);
    if (!block) continue;
    const title = getBlockTitle(block, recordMap);
    if (title?.trim()) parts.push(title.trim());
  }
  return normalizeText(parts.join(" "));
}

function wordCoverage(notionBody: string, pageText: string): number {
  const words = notionBody
    .split(" ")
    .filter((w) => w.length >= 4);
  if (!words.length) return 1;
  let hit = 0;
  for (const word of words) {
    if (pageText.includes(word)) hit += 1;
  }
  return hit / words.length;
}

async function waitForServer(baseUrl: string, timeoutMs = 120_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseUrl, { redirect: "follow" });
      if (res.ok || res.status === 404) return;
    } catch {
      // server still booting
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not become ready at ${baseUrl} within ${timeoutMs}ms`);
}

/** Notion body renders client-side (react-notion-x); need a real browser for body text. */
async function fetchRenderedMainText(url: string): Promise<string> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
    await page.waitForSelector(".notion-page", { timeout: 60_000 });
    await page.waitForFunction(
      () => {
        const root = document.querySelector(".notion-page");
        return Boolean(root && root.textContent && root.textContent.trim().length > 40);
      },
      { timeout: 60_000 },
    );
    const text = await page.locator("main.project-article, main").first().innerText();
    return normalizeText(text);
  } finally {
    await browser.close();
  }
}

function startDevServer(port: number): ChildProcess {
  return spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: portfolioRoot,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function main(): Promise<void> {
  const published = await fetchPublishedPosts();
  if (!published.length) {
    throw new Error(
      "No Published posts in Blog Entries — set Status=Published on at least one row (same as /blog listing).",
    );
  }

  const post = published[0];
  console.log(
    `Notion: first published post → slug="${post.slug}" title="${post.title}"`,
  );

  const serverMatch = await fetchPostBySlug(post.slug);
  if (!serverMatch) {
    throw new Error(
      `fetchPostBySlug("${post.slug}") returned null — check Slug filter / integration access.`,
    );
  }

  const recordMap = await fetchRecordMap(serverMatch.page.id);
  const notionBody = recordMapPlainText(recordMap, serverMatch.page.id);
  if (!notionBody) {
    throw new Error("Notion page body extracted as empty — is the post shared/public for notion-client?");
  }

  let baseUrl = process.env.TEST_BASE_URL?.replace(/\/$/, "");
  let child: ChildProcess | undefined;

  if (!baseUrl) {
    const port = Number(process.env.TEST_PORT ?? DEFAULT_PORT);
    baseUrl = `http://127.0.0.1:${port}`;
    child = startDevServer(port);
    child.stdout?.on("data", (chunk: Buffer) => {
      const line = chunk.toString();
      if (line.toLowerCase().includes("error")) process.stderr.write(line);
    });
    child.stderr?.on("data", (chunk: Buffer) => process.stderr.write(chunk));
    try {
      await waitForServer(baseUrl);
    } catch (err) {
      child.kill("SIGTERM");
      throw err;
    }
  }

  try {
    const projectUrl = `${baseUrl}/blog/${post.slug}`;
    const indexUrl = `${baseUrl}/blog`;

    const [projectRes, indexRes] = await Promise.all([
      fetch(projectUrl, { redirect: "follow" }),
      fetch(indexUrl, { redirect: "follow" }),
    ]);

    if (!projectRes.ok) {
      throw new Error(`GET ${projectUrl} → ${projectRes.status} ${projectRes.statusText}`);
    }
    if (!indexRes.ok) {
      throw new Error(`GET ${indexUrl} → ${indexRes.status} ${indexRes.statusText}`);
    }

    const projectHtml = await projectRes.text();
    const indexHtml = await indexRes.text();

    if (!indexHtml.includes(`/blog/${post.slug}`)) {
      throw new Error(`Index page does not link to /blog/${post.slug}`);
    }
    if (!indexHtml.includes('href="/"') && !indexHtml.includes("href='/'")) {
      throw new Error("Blog index does not link back to the homepage");
    }

    const h1 = extractH1(projectHtml);
    const normalizedTitle = normalizeText(post.title);
    if (h1 !== normalizedTitle) {
      throw new Error(`Title mismatch: Notion "${post.title}" vs page h1 "${h1 ?? "(missing)"}"`);
    }

    if (post.excerpt) {
      const intro = extractSectionIntro(projectHtml);
      const normalizedExcerpt = normalizeText(post.excerpt);
      if (intro !== normalizedExcerpt) {
        throw new Error(
          `Excerpt mismatch: Notion "${post.excerpt}" vs section-intro "${intro ?? "(missing)"}"`,
        );
      }
    }

    const pageText = await fetchRenderedMainText(projectUrl);
    const coverage = wordCoverage(notionBody, pageText);
    const minCoverage = Number(process.env.NOTION_PARITY_MIN_COVERAGE ?? "0.65");
    if (coverage < minCoverage) {
      throw new Error(
        `Body text overlap ${(coverage * 100).toFixed(1)}% is below ${(minCoverage * 100).toFixed(0)}% threshold.\n` +
          `Notion sample: ${notionBody.slice(0, 200)}…\n` +
          `Page sample: ${pageText.slice(0, 200)}…`,
      );
    }

    console.log("OK: index links, title, excerpt, and body text align with Notion.");
    console.log(`  URL: ${projectUrl}`);
    console.log(`  Body word coverage: ${(coverage * 100).toFixed(1)}%`);
  } finally {
    child?.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
