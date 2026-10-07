"use client";

import { useMemo, useState } from "react";
import type { ProjectPost } from "../lib/notion/posts";

type ProjectSearchProps = {
  posts: ProjectPost[];
};

export function ProjectSearch({ posts }: ProjectSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      const haystack = [post.title, post.excerpt, post.slug, ...post.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

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
      <p className="muted project-search-meta">
        {filtered.length} of {posts.length} published{" "}
        {posts.length === 1 ? "project" : "projects"}
        {query.trim() ? ` matching “${query.trim()}”` : ""}
      </p>
      <ul className="project-search-results">
        {filtered.map((post) => (
          <li key={post.id}>
            <a href={`/projects/${post.slug}`}>
              <strong>{post.title}</strong>
              {post.excerpt ? <span>{post.excerpt}</span> : null}
              {post.tags.length ? (
                <span className="project-tags">{post.tags.join(" · ")}</span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
