const DEFAULT_REVALIDATE_SECONDS = 3600;

export function getNotionIntegrationToken(): string | undefined {
  return process.env.NOTION_TOKEN ?? process.env.NOTION_API_KEY;
}

export function getBlogDatabaseId(): string | undefined {
  return process.env.NOTION_BLOG_DATABASE_ID;
}

/** Notion API 2025+ data source id (Blog Entries collection). */
export function getBlogDataSourceId(): string | undefined {
  return (
    process.env.NOTION_BLOG_DATA_SOURCE_ID ??
    process.env.NOTION_BLOG_DATABASE_ID
  );
}

export function getRevalidateSeconds(): number {
  const raw = process.env.NOTION_REVALIDATE_SECONDS;
  if (!raw) return DEFAULT_REVALIDATE_SECONDS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_REVALIDATE_SECONDS;
}

export function getSiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://zarubawalker.com";
}

export function isNotionConfigured(): boolean {
  return Boolean(getNotionIntegrationToken() && getBlogDataSourceId());
}
