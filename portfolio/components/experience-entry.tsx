import { problemLabels, type ExperienceEntry } from "../lib/content";

type EvidenceLink = {
  slug: string;
  title: string;
};

type ExperienceEntryProps = {
  entry: ExperienceEntry;
  evidenceLinks?: EvidenceLink[];
};

export function ExperienceEntryCard({ entry, evidenceLinks = [] }: ExperienceEntryProps) {
  return (
    <article className="experience-card" id={entry.id}>
      <p className="meta">
        {entry.period} · {entry.organization}
      </p>
      <h3>
        {entry.title} · {entry.organization}
      </h3>
      {entry.problems.length ? (
        <div className="problem-row" aria-label="Problems this role demonstrates">
          {entry.problems.map((problem) => (
            <span key={problem}>{problemLabels[problem]}</span>
          ))}
        </div>
      ) : null}
      <p>{entry.situation}</p>
      <p className="star-line">
        <strong>Task.</strong> {entry.task}
      </p>
      <p className="star-line">
        <strong>Action.</strong> {entry.action}
      </p>
      {entry.result ? (
        <p className="star-line">
          <strong>Result.</strong> {entry.result}
        </p>
      ) : null}
      {evidenceLinks.length ? (
        <div className="inspect-links">
          {evidenceLinks.map((link) => (
            <a key={link.slug} href={`/blog/${link.slug}`}>
              Evidence: {link.title} →
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
