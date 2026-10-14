"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { postsMatching } from "../lib/blog-tags";
import { evidenceView } from "../lib/content";
import type { ProjectPost } from "../lib/notion/posts";

type ProjectSearchProps = {
  posts: ProjectPost[];
};

export function ProjectSearch({ posts }: ProjectSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => postsMatching(posts, query), [posts, query]);

  const trimmed = query.trim();
  const noun = posts.length === 1 ? "project" : "projects";
  const count = trimmed
    ? `${filtered.length} of ${posts.length} published ${noun} matching “${trimmed}”`
    : `${posts.length} published ${noun}`;

  return (
    <div className="project-search">
      <label className="sr-only" htmlFor="project-search">
        Search projects
      </label>
      <input
        id="project-search"
        type="search"
        placeholder="Search by skill, tag, or keyword…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />
      <p className="muted project-search-meta">{count}</p>
      {filtered.length ? (
        <section className="studies" aria-label="Published posts">
          {filtered.map((post) => {
            const evidence = evidenceView(post);
            return (
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
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.tags.length ? (
                  <div className="problem-row" aria-label="Tags">
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                ) : null}
                {evidence.problemSolved ? (
                  <p>
                    <strong>Problem solved.</strong> {evidence.problemSolved}
                  </p>
                ) : null}
                {evidence.proves ? (
                  <p>
                    <strong>What this proves.</strong> {evidence.proves}
                  </p>
                ) : null}
                <p>
                  <Link href={`/blog/${post.slug}`}>Read more →</Link>
                </p>
              </article>
            );
          })}
        </section>
      ) : (
        <p className="muted">No posts match that search.</p>
      )}
    </div>
  );
}
