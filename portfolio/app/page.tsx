import { ExperienceEntryCard } from "../components/experience-entry";
import { HowIWorkCard } from "../components/how-i-work-card";
import { SiteNav } from "../components/site-nav";
import { FeaturedProjectsDynamic } from "../components/featured-projects-dynamic";
import {
  about,
  experience,
  featuredProjects,
  influences,
  problemLabels,
  site,
} from "../lib/content";
import { fetchPublishedPosts } from "../lib/notion/posts";

const resumePdf = "/ethan-zaruba-walker-resume.pdf";

const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Let's connect")}`;

export default async function HomePage() {
  const publishedProjects = await fetchPublishedPosts();
  const publishedBySlug = new Map(publishedProjects.map((post) => [post.slug, post]));
  const fallbackEvidence = featuredProjects.filter((project) => project.inspect.length > 0);

  return (
    <>
      <SiteNav />

      <section className="hero" id="about">
        <div>
          <p className="kicker">About</p>
          <h1>{site.name}</h1>
          <p className="lede" style={{ marginTop: "20px" }}>
            {about.greeting}
          </p>
          <p>{about.problem}</p>
          <p>{about.method}</p>
          <p>{about.personal}</p>
          <div className="domains" aria-label="Focus areas">
            {about.domains.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="hero-actions">
            <a className="button" href={resumePdf} target="_blank" rel="noreferrer">
              Download résumé (PDF)
            </a>
            <a className="button-ghost" href="#experience">
              Explore my work
            </a>
            <a className="button-ghost" href="/blog">
              Blog
            </a>
            <a className="button-ghost" href={mailto}>
              Contact
            </a>
          </div>
          <p className="contact-line" style={{ marginTop: "18px" }}>
            <a href={mailto}>{site.email}</a> ·{" "}
            <a href={site.linkedIn} target="_blank" rel="noreferrer">
              LinkedIn
            </a>{" "}
            ·{" "}
            <a href={site.github} target="_blank" rel="noreferrer">
              GitHub
            </a>{" "}
            ·{" "}
            <a href={site.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </p>
        </div>
        <HowIWorkCard />
      </section>

      <section id="experience">
        <p className="kicker">Experience</p>
        <h2>What happened, and what I took from it</h2>
        <p className="section-intro">
          Each role starts with the situation, then a task, action, and result you can scan. A link
          appears only when a published deep dive supports the claim.
        </p>
        <div className="timeline">
          {experience.map((entry) => {
            const evidenceLinks = (entry.evidenceSlugs ?? []).flatMap((slug) => {
              const post = publishedBySlug.get(slug);
              return post ? [{ slug, title: post.title }] : [];
            });
            return (
              <ExperienceEntryCard
                key={entry.id}
                entry={entry}
                evidenceLinks={evidenceLinks}
              />
            );
          })}
        </div>
      </section>

      <section id="featured-projects">
        <p className="kicker">Evidence</p>
        <h2>Evidence you can inspect</h2>
        <p className="section-intro">
          {publishedProjects.length
            ? "Published blog deep dives. Each card names the problem, what the write-up proves, and where to read it."
            : "Blog deep dives are not loaded in this preview. These cards are public artifacts already on the record."}
        </p>
        {publishedProjects.length ? (
          <>
            <FeaturedProjectsDynamic posts={publishedProjects} />
            <p style={{ marginTop: "1rem" }}>
              <a href="/blog">Browse the blog and search by skill →</a>
            </p>
          </>
        ) : (
          <div className="studies">
            {fallbackEvidence.map((project) => (
              <article className="project-card" key={project.id} id={`project-${project.id}`}>
                <p className="muted">Preview artifact</p>
                <h3>{project.title}</h3>
                {project.problems?.length ? (
                  <div className="problem-row">
                    {project.problems.map((problem) => (
                      <span key={problem}>{problemLabels[problem]}</span>
                    ))}
                  </div>
                ) : null}
                <p>
                  <strong>Problem solved.</strong> {project.problemSolved ?? project.problem}
                </p>
                <p>
                  <strong>What this proves.</strong> {project.proves ?? project.outcome}
                </p>
                {project.outcomeNote ? <p className="muted">{project.outcomeNote}</p> : null}
                <div className="inspect-links">
                  {project.inspect.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {influences.length > 0 ? (
        <section id="influences">
          <p className="kicker">Direction of growth</p>
          <h2>Reading & luminaries</h2>
          <p className="section-intro">
            People and ideas Ethan is actively learning from—not a recommendation engine.
          </p>
          <div className="studies">
            {influences.map((item) => (
              <article className="study" key={`${item.status}-${item.subject}`}>
                <p className="meta">{item.status.replace("_", " ")}</p>
                <h3>{item.subject}</h3>
                <p>
                  <strong>Question:</strong> {item.question}
                </p>
                <p>{item.note}</p>
                {item.href ? (
                  <p>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="contact" id="contact">
        <div>
          <h2>Contact</h2>
          <p>
            If you are building a system that has to work for the people doing the job, write me and
            tell me what is stuck.
          </p>
          <p>
            <a href={mailto}>{site.email}</a>
          </p>
        </div>
        <div>
          <p className="kicker" style={{ color: "var(--brass-bright)" }}>
            Résumé
          </p>
          <p>
            <a href={resumePdf} target="_blank" rel="noreferrer">
              Download PDF
            </a>
          </p>
        </div>
      </section>

      <footer>
        {site.name} · {site.location}
      </footer>
    </>
  );
}
