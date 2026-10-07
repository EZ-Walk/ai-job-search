import type { ExperienceEntry, FeaturedProject } from "../lib/content";

type ExperienceEntryProps = {
  entry: ExperienceEntry;
  featuredProject?: FeaturedProject;
};

export function ExperienceEntryCard({ entry, featuredProject }: ExperienceEntryProps) {
  return (
    <article className="experience-card" id={entry.id}>
      <p className="meta">
        {entry.period} · {entry.organization}
      </p>
      <h3>
        {entry.title} · {entry.organization}
      </h3>
      <p>
        <strong>Context.</strong> {entry.context}
      </p>
      <p>
        <strong>Contribution.</strong> {entry.contribution}
      </p>
      <p>
        <strong>Outcome.</strong> {entry.outcome}
      </p>
      {entry.lesson ? (
        <p>
          <strong>Lesson.</strong> {entry.lesson}
        </p>
      ) : null}
      {entry.lessonPendingQuestion ? (
        <p className="muted">
          <strong>Open for Ethan:</strong> {entry.lessonPendingQuestion}
        </p>
      ) : null}
      {featuredProject ? (
        <p>
          <a href={`#project-${featuredProject.id}`}>
            Featured project: {featuredProject.title} →
          </a>
        </p>
      ) : null}
    </article>
  );
}
