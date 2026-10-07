import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

function isFullPage(
  page: PageObjectResponse,
): page is PageObjectResponse & { properties: Record<string, unknown> } {
  return "properties" in page;
}

export function richTextPlain(
  items: RichTextItemResponse[] | undefined,
): string {
  if (!items?.length) return "";
  return items.map((item) => item.plain_text).join("");
}

function getProp(page: PageObjectResponse, name: string): unknown {
  if (!isFullPage(page)) return undefined;
  return page.properties[name];
}

export function pageTitle(page: PageObjectResponse): string {
  const title = getProp(page, "Title") as
    | { type: "title"; title: RichTextItemResponse[] }
    | undefined;
  if (title?.type === "title") return richTextPlain(title.title);
  return "Untitled";
}

export function pageSlug(page: PageObjectResponse): string {
  const slug = getProp(page, "Slug") as
    | { type: "rich_text"; rich_text: RichTextItemResponse[] }
    | undefined;
  if (slug?.type === "rich_text") return richTextPlain(slug.rich_text).trim();
  return "";
}

export function pageExcerpt(page: PageObjectResponse): string {
  const excerpt = getProp(page, "Excerpt") as
    | { type: "rich_text"; rich_text: RichTextItemResponse[] }
    | undefined;
  if (excerpt?.type === "rich_text") return richTextPlain(excerpt.rich_text).trim();
  return "";
}

export function pageTags(page: PageObjectResponse): string[] {
  const tags = getProp(page, "Tags") as
    | { type: "multi_select"; multi_select: { name: string }[] }
    | undefined;
  if (tags?.type === "multi_select") {
    return tags.multi_select.map((t) => t.name).filter(Boolean);
  }
  return [];
}

export function pagePublishDate(page: PageObjectResponse): string | undefined {
  const date = getProp(page, "Publish date") as
    | { type: "date"; date: { start: string | null } | null }
    | undefined;
  if (date?.type === "date" && date.date?.start) return date.date.start;
  return undefined;
}

export function pageCoverUrl(page: PageObjectResponse): string | undefined {
  const cover = getProp(page, "Cover image") as
    | {
        type: "files";
        files: Array<
          | { type: "external"; external: { url: string } }
          | { type: "file"; file: { url: string } }
        >;
      }
    | undefined;
  if (cover?.type !== "files" || !cover.files.length) return undefined;
  const file = cover.files[0];
  if (file.type === "external") return file.external.url;
  if (file.type === "file") return file.file.url;
  return undefined;
}

export function pageSeoTitle(page: PageObjectResponse): string {
  const seo = getProp(page, "SEO title") as
    | { type: "rich_text"; rich_text: RichTextItemResponse[] }
    | undefined;
  if (seo?.type === "rich_text") {
    const text = richTextPlain(seo.rich_text).trim();
    if (text) return text;
  }
  return pageTitle(page);
}
