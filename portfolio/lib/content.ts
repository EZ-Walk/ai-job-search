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

export type ExperienceEntry = {
  id: string;
  period: string;
  title: string;
  organization: string;
  context: string;
  contribution: string;
  outcome: string;
  featuredProjectId?: string;
  lesson?: string;
  lessonPendingQuestion?: string;
};

export const experience: ExperienceEntry[] = [
  {
    id: "staffroom-consulting",
    period: "2023–present",
    title: "Founder & consultant",
    organization: "Staff Room AI",
    context:
      "Operators needed systems that matched how work actually moved—not another dashboard that sat beside the job.",
    contribution:
      "Led discovery, mapped information flows, designed integrations and automation, and trained teams on the new operating model.",
    outcome:
      "Documented delivery across ingestion modernization, LLM evaluation design, and a legal-AI hypothesis with requirements, use cases, and a runnable service.",
    featuredProjectId: "mediamark-spotlight",
  },
  {
    id: "ibm",
    period: "2017–2020",
    title: "Cognitive software and data engineer",
    organization: "IBM",
    context:
      "Support engineers lost time when the similar case was buried in tooling they were not already using.",
    contribution:
      "Designed a similar-case tool inside Slack and built analytics around case topics, volume, and outcomes.",
    outcome:
      "Similar cases could surface in the channel where support work already happened.",
    featuredProjectId: "ibm-similar-case",
  },
  {
    id: "valhalla",
    period: "May–Aug 2021",
    title: "Machine learning engineer (intern)",
    organization: "Valhalla Healthcare",
    context: "Handwritten clinical notes never became a record the rest of the work could use.",
    contribution: "Built a model pipeline from handwritten notes into a structured data model.",
    outcome: "Handwritten notes could enter a data model downstream systems could use.",
    featuredProjectId: "valhalla-healthcare",
  },
  {
    id: "wiz",
    period: "2022",
    title: "Community development intern",
    organization: "Wiz Music · Barcelona",
    context: "Community metrics did not match what operators believed about growth.",
    contribution:
      "Diagnosed instrumentation gaps, raised non-organic growth patterns, and tested artist-feed interventions.",
    outcome: "Clearer metrics judgment for community operators.",
    lessonPendingQuestion:
      "What is the one sentence you want visitors to remember from the Wiz Music internship?",
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
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "ibm-similar-case",
    title: "IBM similar-case tool",
    problem: "People lost time hunting for a case that looked like the one in front of them.",
    discovery:
      "Support cases supplied the signal; stakeholder interviews and Cognos dashboards showed where time disappeared.",
    architecture: "A similar-case tool inside Slack, where support work already happened.",
    delivery: "Designed and built the Slack tool as a cognitive software and data engineer, 2017–2020.",
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
