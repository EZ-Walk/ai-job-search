import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  getBlogDataSourceId,
  getNotionIntegrationToken,
  isNotionConfigured,
} from "./config";
import {
  pageCoverUrl,
  pageExcerpt,
  pagePublishDate,
  pageSeoTitle,
  pageSlug,
  pageTags,
  pageTitle,
} from "./properties";

export type ProjectPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  coverUrl?: string;
  publishDate?: string;
  seoTitle: string;
};

function notionClient(): Client {
  const token = getNotionIntegrationToken();
  if (!token) throw new Error("NOTION_TOKEN is not configured");
  return new Client({ auth: token });
}

function toProjectPost(page: PageObjectResponse): ProjectPost | null {
  const slug = pageSlug(page);
  if (!slug) return null;
  return {
    id: page.id,
    title: pageTitle(page),
    slug,
    excerpt: pageExcerpt(page),
    tags: pageTags(page),
    coverUrl: pageCoverUrl(page),
    publishDate: pagePublishDate(page),
    seoTitle: pageSeoTitle(page),
  };
}

export async function fetchPublishedPosts(): Promise<ProjectPost[]> {
  if (!isNotionConfigured()) return [];

  const dataSourceId = getBlogDataSourceId()!;
  const notion = notionClient();

  const posts: ProjectPost[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: "Status",
        status: { equals: "Published" },
      },
      sorts: [
        {
          property: "Publish date",
          direction: "descending",
        },
      ],
      start_cursor: cursor,
    });

    for (const row of response.results) {
      if (!("properties" in row)) continue;
      const post = toProjectPost(row as PageObjectResponse);
      if (post) posts.push(post);
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return posts;
}

export async function fetchPostBySlug(slug: string): Promise<{
  post: ProjectPost;
  page: PageObjectResponse;
} | null> {
  if (!isNotionConfigured()) return null;

  const dataSourceId = getBlogDataSourceId()!;
  const notion = notionClient();

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        { property: "Status", status: { equals: "Published" } },
        { property: "Slug", rich_text: { equals: slug } },
      ],
    },
    page_size: 1,
  });

  const row = response.results[0];
  if (!row || !("properties" in row)) return null;

  const page = row as PageObjectResponse;
  const post = toProjectPost(page);
  if (!post) return null;

  return { post, page };
}

export async function writePostSyncMetadata(
  pageId: string,
  liveUrl: string,
): Promise<void> {
  if (!isNotionConfigured()) return;

  const notion = notionClient();
  const now = new Date().toISOString();

  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Live URL": { url: liveUrl },
      "Last synced": { date: { start: now } },
    },
  });
}
