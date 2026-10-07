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
  alternates: { canonical: "/projects" },
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
          Long-form write-ups authored in Notion. Set a row to{" "}
          <strong>Published</strong> in Blog Entries to list it here.
        </p>
        {posts.length ? (
          <>
            <ProjectSearch posts={posts} />
            <section className="studies" aria-label="All published projects">
              {posts.map((post) => (
                <article className="project-card" key={post.id}>
                  {post.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverUrl}
                      alt=""
                      className="project-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <h2>
                    <Link href={`/projects/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                  {post.tags.length ? (
                    <p className="muted project-tags">{post.tags.join(" · ")}</p>
                  ) : null}
                  <p>
                    <Link href={`/projects/${post.slug}`}>Read the deep dive →</Link>
                  </p>
                </article>
              ))}
            </section>
          </>
        ) : (
          <p className="muted">
            No published projects yet. When Notion is connected and posts are set to{" "}
            <strong>Published</strong>, they appear here automatically.
          </p>
        )}
        <p style={{ marginTop: "2rem" }}>
          <Link href="/">← Back to portfolio home</Link>
        </p>
      </main>
    </>
  );
}
