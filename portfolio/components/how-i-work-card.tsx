import Image from "next/image";
import { site } from "../lib/content";

export function HowIWorkCard() {
  return (
    <aside className="card">
      <div>
        <Image
          src="/ethan-portrait.png"
          alt="Ethan Zaruba-Walker"
          width={320}
          height={320}
          className="how-i-work-photo"
          priority
        />
        <p className="kicker" style={{ color: "var(--brass-bright)" }}>
          How I work
        </p>
        <p>
          Uncover what people actually need, shape the architecture, and communicate it back as
          it is being built—through discovery, specifications, working software, and training.
        </p>
      </div>
      <p>
        <a href={site.staffRoom} target="_blank" rel="noreferrer">
          staffroomai.com
        </a>
        <br />
        <span className="muted" style={{ color: "rgba(244,239,230,0.75)" }}>
          {site.location}
        </span>
      </p>
    </aside>
  );
}
