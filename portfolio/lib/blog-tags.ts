import type { ProjectPost } from "./notion/posts";

/** Unique Tags values from a pull of published posts, in first-seen order. */
export function collectTags(posts: ProjectPost[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const post of posts) {
    for (const tag of post.tags) {
      const name = tag.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      tags.push(name);
    }
  }
  return tags;
}

/** Posts whose title, excerpt, slug, or Notion tags contain the query. */
export function postsMatching(posts: ProjectPost[], query: string): ProjectPost[] {
  const q = query.trim().toLowerCase();
  if (!q) return posts;
  return posts.filter((post) => {
    const haystack = [post.title, post.excerpt, post.slug, ...post.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
