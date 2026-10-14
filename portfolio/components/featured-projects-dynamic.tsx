import { evidenceView } from "../lib/content";
import type { ProjectPost } from "../lib/notion/posts";

type FeaturedProjectsDynamicProps = {
  posts: ProjectPost[];
  heading?: "h2" | "h3";
};

function TagChips({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="problem-row" aria-label="Tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

export function FeaturedProjectsDynamic({
  posts,
  heading = "h3",
}: FeaturedProjectsDynamicProps) {
  if (!posts.length) return null;
  const Heading = heading;

  return (
    <div className="studies">
      {posts.map((post) => {
        const evidence = evidenceView(post);
        return (
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
            <Heading>
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </Heading>
            <TagChips tags={post.tags} />
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
              <a href={`/blog/${post.slug}`}>Read the evidence →</a>
            </p>
          </article>
        );
      })}
    </div>
  );
}
