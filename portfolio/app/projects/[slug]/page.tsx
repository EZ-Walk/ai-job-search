import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NotionPageRenderer } from "../../../components/notion-renderer";
import { SiteNav } from "../../../components/site-nav";
import { site } from "../../../lib/content";
import { getSiteBaseUrl } from "../../../lib/notion/config";
import { fetchPostBySlug, writePostSyncMetadata } from "../../../lib/notion/posts";
import { fetchRecordMap } from "../../../lib/notion/record-map";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { fetchPublishedPosts } = await import("../../../lib/notion/posts");
  const posts = await fetchPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = await fetchPostBySlug(slug);
  if (!match) return { title: "Project not found" };

  const { post } = match;
  const description = post.excerpt || post.title;
  const url = `${getSiteBaseUrl()}/projects/${post.slug}`;

  return {
    title: `${post.seoTitle} — ${site.name}`,
    description,
    alternates: { canonical: `/projects/${post.slug}` },
    openGraph: {
      title: post.seoTitle,
      description,
      url,
      type: "article",
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function ProjectDeepDivePage({ params }: PageProps) {
  const { slug } = await params;
  const match = await fetchPostBySlug(slug);
  if (!match) notFound();

  const { post, page } = match;
  let recordMap;
  try {
    recordMap = await fetchRecordMap(page.id);
  } catch {
    notFound();
  }

  const liveUrl = `${getSiteBaseUrl()}/projects/${post.slug}`;
  try {
    await writePostSyncMetadata(page.id, liveUrl);
  } catch {
    // Write-back is best-effort; rendering should still succeed.
  }

  return (
    <>
      <SiteNav />
      <main className="page-shell project-article">
        <p className="kicker">Project deep dive</p>
        <h1>{post.title}</h1>
        {post.excerpt ? <p className="section-intro">{post.excerpt}</p> : null}
        {post.tags.length ? (
          <p className="muted project-tags">{post.tags.join(" · ")}</p>
        ) : null}
        <NotionPageRenderer recordMap={recordMap} rootPageId={page.id} />
        <p style={{ marginTop: "2.5rem" }}>
          <Link href="/projects">← All projects</Link>
        </p>
      </main>
    </>
  );
}
