export const site = {
  name: "Ethan Zaruba-Walker",
  email: "ethan@zwconsultingllc.net",
  location: "San Francisco Bay",
  linkedIn: "https://www.linkedin.com/in/ezwalk",
  github: "https://github.com/EZ-Walk",
  instagram: "https://www.instagram.com/ez.walk/",
  staffRoom: "https://staffroomai.com",
  canonical: "https://zarubawalker.com",
} as const;

export const about = {
  greeting:
    "Howdy, I'm Ethan Zaruba-Walker. I translate between what people need and what technology systems can deliver.",
  problem:
    "Organizations' valuable work is trapped in fragmented information, manual handoffs, and software that hasn't become a dependable way of operating. I make that work legible, design the system around the people doing it, build the missing connections, and train people in the new system that solves their problems.",
  method:
    "My favorite part of the work is uncovering what people actually need, shaping the architecture, and communicating it back to them as it's being built. My background spans data and AI engineering at IBM, healthcare machine learning, and my own consulting practice.",
  personal:
    "That work connects to a wider interest of mine: exploring, articulating, and making useful what I learn about people and the world. I live aboard a sailboat in San Francisco Bay, and I value the freedom to travel and adventure in nature.",
  domains: [
    "Discovery & process mapping",
    "Data platforms",
    "AI systems",
    "Workflow automation",
    "Enablement",
  ],
} as const;

export type ProblemId =
  | "discovery-solution-design"
  | "first-of-kind-architecture"
  | "integrations-ai-configuration"
  | "deployment-leadership"
  | "adoption-handoff"
  | "reusable-delivery-assets"
  | "field-to-product-feedback";

export const problemLabels: Record<ProblemId, string> = {
  "discovery-solution-design": "Discovery & solution design",
  "first-of-kind-architecture": "First-of-kind architecture",
  "integrations-ai-configuration": "Integrations & AI configuration",
  "deployment-leadership": "Deployment leadership",
  "adoption-handoff": "Adoption & handoff",
  "reusable-delivery-assets": "Reusable delivery assets",
  "field-to-product-feedback": "Field-to-product feedback",
};

const problemIdByLabel = new Map(
  Object.entries(problemLabels).map(([id, label]) => [label.toLowerCase(), id as ProblemId]),
);

export type ExperienceEntry = {
  id: string;
  period: string;
  title: string;
  organization: string;
  situation: string;
  task: string;
  action: string;
  result?: string;
  problems: ProblemId[];
  /** Blog slugs whose published deep dives support this role. */
  evidenceSlugs?: string[];
};

export const experience: ExperienceEntry[] = [
  {
    id: "staffroom-consulting",
    period: "Oct 2023–present",
    title: "Founder & consultant",
    organization: "Staff Room AI",
    situation:
      "Small operators needed AI systems that matched how work actually moved, and they did not have an in-house team to build them. Each engagement had to end with operators who could keep the system running.",
    task: "Own discovery through training, and leave a system the client can run.",
    action: "Mapped the work, built Notion and automation systems, and trained operators at handoff.",
    result: "Ingestion capacity +99.8% and cost −86%; operators took over the systems.",
    problems: [
      "discovery-solution-design",
      "first-of-kind-architecture",
      "integrations-ai-configuration",
      "deployment-leadership",
      "adoption-handoff",
      "reusable-delivery-assets",
    ],
  },
  {
    id: "ibm",
    period: "Aug 2018–Dec 2020",
    title: "Cognitive software and data engineer",
    organization: "IBM",
    situation:
      "Support engineers lost hours preparing client logs before they could analyze a case. Past resolutions were just as hard to find, buried outside the channel where the work already happened.",
    task: "Surface past resolutions and usable logs inside existing support tools.",
    action: "Ran discovery with support teams, then shipped a Slack case-matcher and a log pipeline.",
    result: "Common problems resolved in one Slack response; log-analysis effort fell by an order of magnitude.",
    problems: [
      "discovery-solution-design",
      "integrations-ai-configuration",
      "deployment-leadership",
      "adoption-handoff",
      "reusable-delivery-assets",
    ],
    evidenceSlugs: ["solve-analytics", "ibm-log-analyze-overview"],
  },
  {
    id: "valhalla",
    period: "May–Aug 2021",
    title: "Machine learning engineer (intern)",
    organization: "Valhalla Healthcare",
    situation:
      "Clinicians recorded care in handwritten notes that never became a record the rest of the work could use.",
    task: "Turn handwritten clinical notes into a data model other workflows could use.",
    action: "Researched the pipeline, trained a Keras and TensorFlow model, and packaged it in Docker.",
    result: "Handwritten notes entered an extensible data model at F1 80.03.",
    problems: [
      "discovery-solution-design",
      "first-of-kind-architecture",
      "integrations-ai-configuration",
      "reusable-delivery-assets",
    ],
    evidenceSlugs: ["auto-note"],
  },
  {
    id: "wiz",
    period: "May–Jul 2022",
    title: "Community development intern",
    organization: "Wiz Music · Barcelona",
    situation:
      "A music startup read its Discord member count as growth, but the join sources did not support that story. Artists, the reason people would stay, were missing from the server.",
    task: "Show what the membership data actually said, then test one fix.",
    action: "Segmented joins by source, raised the inorganic pattern, and shipped an artist AMA.",
    result: "The team corrected its baseline, and the AMA shipped as a paid artist perk.",
    problems: ["discovery-solution-design", "field-to-product-feedback"],
  },
];

export type FeaturedProject = {
  id: string;
  title: string;
  problem: string;
  discovery: string;
  architecture: string;
  delivery: string;
  outcome: string;
  inspect: { label: string; href: string }[];
  outcomeNote?: string;
  problems?: ProblemId[];
  problemSolved?: string;
  proves?: string;
};

export type EvidenceOverlay = {
  problems: ProblemId[];
  problemSolved: string;
  proves: string;
};

/** Fills homepage evidence cards when a published post has no tags or excerpt yet. */
export const evidenceOverlays: Record<string, EvidenceOverlay> = {
  "solve-analytics": {
    problems: [
      "discovery-solution-design",
      "integrations-ai-configuration",
      "adoption-handoff",
    ],
    problemSolved: "Past resolutions were buried outside the Slack channel where support work happened.",
    proves:
      "Design-thinking sessions, a Watson NLP case matcher, and a check-in where common problems resolved in one response.",
  },
  "ibm-log-analyze-overview": {
    problems: [
      "integrations-ai-configuration",
      "deployment-leadership",
      "reusable-delivery-assets",
    ],
    problemSolved: "Support engineers lost hours preparing client logs before analysis could start.",
    proves:
      "A GDPR-minded CaseBase pipeline and SDS-Vis dashboard that cut analysis effort by an order of magnitude.",
  },
  "auto-note": {
    problems: [
      "discovery-solution-design",
      "first-of-kind-architecture",
      "integrations-ai-configuration",
    ],
    problemSolved: "Handwritten clinical notes never became a record other systems could use.",
    proves: "A notes-to-data-model pipeline with a reported F1 of 80.028.",
  },
  "hack-for-racial-justice-2020": {
    problems: ["discovery-solution-design", "first-of-kind-architecture"],
    problemSolved: "Polling access was eroding, and the national gap was hard to see.",
    proves:
      "A hackathon data product that used polling and census data to find underserved communities.",
  },
};

export function evidenceView(post: { slug: string; excerpt: string; tags: string[] }) {
  const overlay = evidenceOverlays[post.slug];
  const taggedProblems = post.tags.flatMap((tag) => {
    const id = problemIdByLabel.get(tag.toLowerCase());
    return id ? [id] : [];
  });
  return {
    problems: taggedProblems.length ? taggedProblems : (overlay?.problems ?? []),
    problemSolved: overlay?.problemSolved,
    proves: post.excerpt.trim() || overlay?.proves,
    extraTags: post.tags.filter((tag) => !problemIdByLabel.has(tag.toLowerCase())),
  };
}

export const featuredProjects: FeaturedProject[] = [
  {
    id: "ibm-similar-case",
    title: "IBM similar-case tool",
    problem: "People lost time hunting for a case that looked like the one in front of them.",
    discovery:
      "Support cases supplied the signal; stakeholder interviews and Cognos dashboards showed where time disappeared.",
    architecture: "A similar-case tool inside Slack, where support work already happened.",
    delivery: "Designed and built the Slack tool as a cognitive software and data engineer, Aug 2018–Dec 2020.",
    outcome: "Similar cases can surface in Slack, in the tool people were already using.",
    inspect: [],
  },
  {
    id: "staffroom-discovery",
    title: "Consulting discovery & delivery",
    problem:
      "Client work stayed trapped in fragmented tools, manual handoffs, and software that had not become a dependable operating system.",
    discovery:
      "Shared language of operations, swimlanes, and ranked automation priorities from live working sessions.",
    architecture:
      "People-centered system design: legible information flows, integrations, and training around the operators doing the work.",
    delivery:
      "Discovery artifacts, specifications, pilots, and enablement— with a person staying the accuracy check.",
    outcome:
      "Documented engagements across ingestion modernization, evaluation design, and legal-AI hypothesis work.",
    inspect: [],
  },
  {
    id: "the-count",
    title: "The Count",
    problem:
      "Personal finance operators needed a trustworthy ledger without surrendering review to a black-box agent.",
    discovery:
      "External expert feedback surfaced trust, reconciliation, and source-of-truth requirements before feature expansion.",
    architecture:
      "Notion Worker syncing bank transactions, hardened Plaid → Supabase pipeline, and Notion OAuth integration.",
    delivery: "Engineering depth in production-shaped modules with inspectable public README and repo boundaries.",
    outcome: "Working integration evidence and a documented backlog from field feedback.",
    problems: ["integrations-ai-configuration", "field-to-product-feedback"],
    problemSolved: "A finance operator needed a ledger they could review, not a black-box agent.",
    proves: "A public README for the Notion worker, Plaid → Supabase pipeline, and Notion OAuth integration.",
    inspect: [
      {
        label: "The Count README",
        href: "https://github.com/Staff-Room/the-count/blob/main/README.md",
      },
    ],
  },
  {
    id: "allies-ingestion",
    title: "Allies Against Slavery ingestion",
    problem: "Ingestion could not keep up with the work, and running it cost too much.",
    discovery: "Throughput and cost had to move together—not as separate optimization projects.",
    architecture: "Modernized data-ingestion path over four months.",
    delivery: "Implemented the ingestion modernization with measured before/after targets.",
    outcome: "Potential throughput +99.8% and cost −86% in four months.",
    outcomeNote: "Reported engagement outcome; treat as potential capacity unless client-confirmed for your context.",
    inspect: [],
  },
  {
    id: "mediamark-spotlight",
    title: "MediaMark Spotlight",
    problem: "Caption and image pairs needed a quality gate a person could recognize.",
    discovery: "Success had to be defined before anyone treated model scores as results.",
    architecture: "LLM-as-a-judge against a written rubric with explicit human agreement target.",
    delivery: "Designed the evaluation workflow and documented the decision rule.",
    outcome: "The ~95% human agreement figure is a target, not a measured result.",
    outcomeNote: "Approximately 95% agreement with a human is the written success criterion—not an achieved metric.",
    inspect: [],
  },
  {
    id: "valhalla-healthcare",
    title: "Valhalla Healthcare",
    problem: "Handwritten clinical notes stayed on paper.",
    discovery: "The record had to become structured before downstream clinical workflows could trust it.",
    architecture: "Model pipeline from handwritten notes into a data model.",
    delivery: "Built the model, May–Aug 2021.",
    outcome: "Handwritten notes can enter a data model.",
    inspect: [],
  },
  {
    id: "legal-ai-hypothesis",
    title: "Legal AI hypothesis",
    problem:
      "Legal drafting for easements is slow, and an unreviewed model is the wrong place to file from.",
    discovery: "Domain, stakeholders, and the manual path had to be documented before the model was the point.",
    architecture:
      "System context, requirements (including non-functional requirements), use cases, and Docker Compose service. A person remains the reviewer.",
    delivery:
      "Documented the system and composed the service. Publicly described as a Staff Room case study.",
    outcome: "A documented hypothesis and a service someone else can start.",
    problems: ["discovery-solution-design", "first-of-kind-architecture"],
    problemSolved: "Easement drafting is slow, and an unreviewed model is the wrong place to file from.",
    proves: "Public system context, requirements, use cases, and a Docker Compose service a reviewer can start.",
    inspect: [
      {
        label: "System context",
        href: "https://github.com/EZ-Walk/legal-ai-hypothesis/blob/main/SYSTEM_CONTEXT.md",
      },
      {
        label: "Requirements spec",
        href: "https://github.com/EZ-Walk/legal-ai-hypothesis/blob/main/SYSTEM_REQUIREMENTS_SPECS.md",
      },
      {
        label: "Use cases",
        href: "https://github.com/EZ-Walk/legal-ai-hypothesis/blob/main/USE_CASE_DIAGRAMS.md",
      },
      {
        label: "docker-compose.yml",
        href: "https://github.com/EZ-Walk/legal-ai-hypothesis/blob/main/docker-compose.yml",
      },
    ],
  },
];

export type Influence = {
  status: "reading" | "read" | "aspiring";
  subject: string;
  question: string;
  note: string;
  href?: string;
  reflectionHref?: string;
};

/** Populated only with Ethan-confirmed items. Section hidden when empty. */
export const influences: Influence[] = [];

export const resume = {
  headline: "Ethan Zaruba-Walker",
  subtitle: about.greeting.split(".")[0] + ".",
  summary: about.problem,
  contact: site,
  experience: [
    {
      heading: "Staff Room AI — AI consultant",
      bullets: [
        "MediaMark Spotlight: designed an LLM-as-a-judge. Success criterion ~95% agreement with a human. That figure is a target, not a measured result.",
        "Allies Against Slavery: modernized data ingestion. Potential throughput +99.8% and cost −86% in four months.",
        "Legal AI hypothesis: documented system context, requirements, use cases, and a Docker Compose service. A person stays the reviewer.",
      ],
    },
    {
      heading: "IBM — Cognitive software and data engineer, 2017–2020",
      bullets: ["Designed a Slack tool that surfaces similar cases."],
    },
    {
      heading: "Valhalla Healthcare — May 2021–Aug 2021",
      bullets: ["Built a model that turns handwritten notes into a data model."],
    },
    {
      heading: "Wiz Music — Intern, Barcelona, 2022",
      bullets: ["Community development internship."],
    },
  ],
  education: [
    "B.S. Information Science, University of Colorado Boulder, May 2023. GPA 3.7. Certificate in Cognitive Science.",
    "Systems and Solutions Architecture, IBM on Coursera, August 2026.",
    "Deep Learning Specialization, January 2021.",
    "TensorFlow Developer, May 2020.",
    "Emergency Medical Technician, May 2024.",
    "AIARE 1, March 2022.",
  ],
} as const;
