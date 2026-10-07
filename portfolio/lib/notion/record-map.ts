import { NotionAPI } from "notion-client";
import type { ExtendedRecordMap } from "notion-types";

const api = new NotionAPI();

function normalizePageId(pageId: string): string {
  if (pageId.includes("-") && pageId.length >= 32) return pageId;
  const normalized = pageId.replace(/-/g, "");
  return `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`;
}

/** Fetch a Notion page as a react-notion-x record map (unofficial read API). */
export async function fetchRecordMap(pageId: string): Promise<ExtendedRecordMap> {
  return api.getPage(normalizePageId(pageId));
}
