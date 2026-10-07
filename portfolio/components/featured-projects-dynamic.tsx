import type { ProjectPost } from "../lib/notion/posts";

type FeaturedProjectsDynamicProps = {
  posts: ProjectPost[];
};

export function FeaturedProjectsDynamic({ posts }: FeaturedProjectsDynamicProps) {
  if (!posts.length) return null;

  return (
    <div className="studies">
      {posts.map((post) => (
        <article className="project-card" key={post.id} id={`project-${post.slug}`}>
          {post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverUrl}
              alt=""
              className="project-cover"
              loading="lazy"
            />
          ) : null}
          <h3>
            <a href={`/projects/${post.slug}`}>{post.title}</a>
          </h3>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
          {post.tags.length ? (
            <p className="muted project-tags">{post.tags.join(" · ")}</p>
          ) : null}
          <p>
            <a href={`/projects/${post.slug}`}>Read the deep dive →</a>
          </p>
        </article>
      ))}
    </div>
  );
}
