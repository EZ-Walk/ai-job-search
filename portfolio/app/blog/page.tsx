import type { Metadata } from "next";
import Link from "next/link";
import { ProjectSearch } from "../../components/project-search";
import { SiteNav } from "../../components/site-nav";
import { site } from "../../lib/content";
import { fetchPublishedPosts } from "../../lib/notion/posts";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Projects — ${site.name}`,
  description:
    "Project deep dives from Notion — discovery, architecture, delivery, and outcomes you can inspect.",
  alternates: { canonical: "/blog" },
};

export default async function ProjectsIndexPage() {
  const posts = await fetchPublishedPosts();

  return (
    <>
      <SiteNav />
      <main className="page-shell">
        <p className="kicker">Featured projects</p>
        <h1>Evidence you can inspect</h1>
        <p className="section-intro">
          Unpolished deep dives into some things I find interesting.
        </p>
        {posts.length ? (
          <ProjectSearch posts={posts} />
        ) : (
          <p className="muted">
            No published projects yet. When Notion is connected and posts are set to{" "}
            <strong>Published</strong>, they appear here automatically.
          </p>
        )}
        <p className="article-back" style={{ marginTop: "2rem" }}>
          <Link className="button-ghost" href="/">
            ← Home
          </Link>
        </p>
      </main>
    </>
  );
}
