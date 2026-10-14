import { site } from "../lib/content";

const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Let's connect")}`;

export function SiteNav() {
  return (
    <header className="nav">
      <a className="brand" href="/">
        {site.name}
      </a>
      <nav className="nav-links" aria-label="Primary">
        <a href="/#about">About</a>
        <a href="/#experience">Experience</a>
        <a href="/#featured-projects">Evidence</a>
      </nav>
      <div className="nav-actions">
        <a className="nav-cta nav-cta-ghost" href="/blog">
          Blog
        </a>
        <a className="nav-cta" href={mailto}>
          Contact
        </a>
      </div>
    </header>
  );
}
