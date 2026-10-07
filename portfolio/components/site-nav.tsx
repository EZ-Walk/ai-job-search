import { site } from "../lib/content";

const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Let's connect")}`;

export function SiteNav() {
  return (
    <header className="nav">
      <a className="brand" href="#about">
        {site.name}
      </a>
      <nav className="nav-links" aria-label="Primary">
        <a href="#about">About</a>
        <a href="#experience">Experience</a>
        <a href="#featured-projects">Featured projects</a>
        <a href="/projects">Project index</a>
      </nav>
      <a className="nav-cta" href={mailto}>
        Contact
      </a>
    </header>
  );
}
