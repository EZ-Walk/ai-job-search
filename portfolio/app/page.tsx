import { ExperienceEntryCard } from "../components/experience-entry";
import { HowIWorkCard } from "../components/how-i-work-card";
import { SiteNav } from "../components/site-nav";
import { FeaturedProjectsDynamic } from "../components/featured-projects-dynamic";
import {
  about,
  experience,
  featuredProjects,
  influences,
  site,
} from "../lib/content";
import { fetchPublishedPosts } from "../lib/notion/posts";

const resumePdf = "/ethan-zaruba-walker-resume.pdf";

const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Let's connect")}`;

export default async function HomePage() {
  const publishedProjects = await fetchPublishedPosts();
  const projectById = new Map(featuredProjects.map((p) => [p.id, p]));

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
          A narrative of the work—not a skills inventory. Each chapter links to a featured project
          when there is public evidence to inspect.
        </p>
        <div className="timeline">
          {experience.map((entry) => {
            const project = entry.featuredProjectId
              ? projectById.get(entry.featuredProjectId)
              : undefined;
            return (
              <ExperienceEntryCard
                key={entry.id}
                entry={entry}
                featuredProject={project}
              />
            );
          })}
        </div>
      </section>

      <section id="featured-projects">
        <p className="kicker">Featured projects</p>
        <h2>Evidence you can inspect</h2>
        <p className="section-intro">
          {publishedProjects.length
            ? "Published deep dives from Notion. Each card opens a full project write-up."
            : "Strongest grounded cases first. Artifacts from one engagement stay attached to one story."}
        </p>
        {publishedProjects.length ? (
          <>
            <FeaturedProjectsDynamic posts={publishedProjects} />
            <p style={{ marginTop: "1rem" }}>
              <a href="/projects">Browse all projects and search by skill →</a>
            </p>
          </>
        ) : (
          <div className="studies">
            {featuredProjects.map((project) => (
              <article className="project-card" key={project.id} id={`project-${project.id}`}>
                <h3>{project.title}</h3>
                <p>
                  <strong>Who needed what?</strong> {project.problem}
                </p>
                <p>
                  <strong>What did I discover?</strong> {project.discovery}
                </p>
                <p>
                  <strong>Architecture & intervention.</strong> {project.architecture}
                </p>
                <p>
                  <strong>Delivery & communication.</strong> {project.delivery}
                </p>
                <p>
                  <strong>What changed?</strong> {project.outcome}
                </p>
                {project.outcomeNote ? <p className="muted">{project.outcomeNote}</p> : null}
                {project.inspect.length > 0 ? (
                  <div className="inspect-links">
                    {project.inspect.map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No public artifact link on this preview yet.</p>
                )}
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
