# Search Queries for Job Scraper

<!-- Populated by /setup (Path A) on 2026-07-15 for Ethan Zaruba-Walker -->
<!-- 2026-09-30: Priority 1 is human-in-the-loop automation analyst (Makai-shaped). Educator lane stays, now Priority 3. Do not overfit educator scrapes to Crossover/Guide titles. -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first.

**Active for this market (US / SF Bay Area):**
- **ashby-search** - US-market Ashby job boards; the outdoor/climate target companies in `documents/outdoor-target-companies.md` are seeded in its helpers (Skydio, Pano AI, Patch, Strava, Eight Sleep, Sofar Ocean, Watershed, Tonal, Whoop, etc.)
- **linkedin-search** - LinkedIn job listings, filter: United States / San Francisco Bay Area
- *(greenhouse-search is being built — once installed it covers Saildrone, onX Maps, Overstory, Carbon Robotics)*

**Installed but irrelevant to this market (skip):** freehire-search, jobindex-search, jobbank-search, jobdanmark-search, jobnet-search (Danish portals)

The `site:` query templates below are the **WebSearch fallback** — for portals without a CLI (Greenhouse/Lever/Workday boards until the CLI lands), company career pages, or when a CLI fails.

## Search Sites

Primary:
- **linkedin.com/jobs** - LinkedIn (filter: United States / San Francisco Bay Area); covered by `linkedin-search` CLI. Primary surface for Montessori, independent, and traditional school roles.
- **edjoin.org** - California public-school jobs (paraeducator, substitute, after-school, some teaching). WebSearch `site:edjoin.org` fallback. No CLI skill yet.
- **ed.crossover.com / jobs.crossover.com** - Alpha School, 2 Hour Learning, GT School, Unbound Academy only. One slice of the educator lane, not the whole search.
- **jobs.ashbyhq.com** - Ashby boards, covered by `ashby-search` CLI (outdoor/climate lane)
- **boards.greenhouse.io** - Greenhouse boards (WebSearch fallback until greenhouse-search CLI is ready)
- **jobs.lever.co** - Lever boards (e.g. AllTrails)

Secondary (company career pages via Google):
- Direct Google searches with `site:` filters for the target companies in `documents/outdoor-target-companies.md` that are on Workday/Rippling/custom ATS (Backroads, YETI, Patagonia, Hipcamp, REI, RoverPass, Staylist, Newbook)
- School career pages: individual Montessori and independent schools, khanlabschool.org, actonacademy.org, prisma.school, alpha.school/learn-more (Alpha hiring redirects to Crossover)

## Query Categories

Queries are grouped by priority. Combine with location terms ("San Francisco Bay Area", "East Bay", "Emeryville", "Berkeley", "Oakland", "Palo Alto") for school roles. School roles are on-site unless the posting says otherwise.

### Priority 1: Human-in-the-loop automation analyst

Current search priority (set 2026-09-30 from Ethan's read of Makai Labs). Company shape: AI automation platform or AI consultancy, human-machine teaming, analyst with client operators. Remote or San Francisco Bay Area. Titles: Business Analyst, Implementation Analyst, Forward Deployed Analyst, AI Solutions Consultant.

```
site:jobs.ashbyhq.com ("Business Analyst" OR "Implementation Analyst" OR "Forward Deployed") (AI OR automation)
site:linkedin.com/jobs ("Business Analyst" OR "Implementation Analyst") (AI OR automation) (remote OR "San Francisco")
site:linkedin.com/jobs "business analyst" ("process mapping" OR "process diagram" OR "functional specification") (AI OR automation) remote
site:linkedin.com/jobs ("human in the loop" OR "human-machine") (analyst OR implementation) (remote OR "San Francisco")
```

### Priority 2: AI Solutions / Client / GTM Engineering

Client-facing AI engineering (builder-seller pattern). Adjacent to Priority 1. Same companies often post both.

```
site:linkedin.com/jobs "AI Solutions Engineer" remote OR "San Francisco"
site:linkedin.com/jobs "Solutions Engineer" AI "San Francisco Bay Area"
site:linkedin.com/jobs "GTM Engineer" remote OR "San Francisco"
site:linkedin.com/jobs "Forward Deployed Engineer" remote OR "San Francisco"
site:linkedin.com/jobs "Sales Engineer" AI OR LLM "San Francisco"
site:linkedin.com/jobs "Client Engineering" IBM OR AI
```

### Priority 3: Bay Area educator roles (Montessori, traditional, AI-native)

Kept lane (search priority 2026-08-31 through 2026-09-29). Run **all three buckets** when the scrape is for schools. Do not return only Alpha/Crossover hits.

**3a. Montessori and close pedagogies**
```
site:linkedin.com/jobs Montessori (Guide OR teacher OR assistant OR intern) ("San Francisco Bay Area" OR Berkeley OR Oakland OR "East Bay" OR "Palo Alto")
site:linkedin.com/jobs (Montessori OR Waldorf OR Reggio) (assistant OR aide OR "after school" OR "after-care") "San Francisco Bay Area"
site:edjoin.org Montessori (teacher OR assistant) (Alameda OR Oakland OR Berkeley OR San Francisco)
```

**3b. Traditional, independent, and entry classroom roles**
```
site:linkedin.com/jobs ("teaching assistant" OR paraeducator OR "instructional aide" OR substitute) (school OR elementary OR "middle school") ("East Bay" OR Berkeley OR Oakland OR "San Francisco")
site:linkedin.com/jobs ("after school" OR "after-school" OR enrichment OR "outdoor education") (instructor OR teacher OR educator) ("San Francisco Bay Area" OR Berkeley)
site:linkedin.com/jobs ("independent school" OR "private school") (teacher OR assistant OR "associate teacher") ("San Francisco Bay Area" OR "East Bay")
site:edjoin.org (paraeducator OR substitute OR "instructional aide" OR "after school") (Alameda OR Berkeley OR Oakland OR "Emeryville")
site:linkedin.com/jobs (tutor OR "academic coach") (K-12 OR elementary OR "middle school") "San Francisco Bay Area"
```

**3c. AI-native Guide / learning-coach (do not let this crowd out 3a/3b)**
```
site:ed.crossover.com Alpha (Guide OR Educator) ("San Francisco" OR "Palo Alto" OR "East Bay" OR "South Bay" OR Piedmont)
site:jobs.crossover.com Alpha Guide ("San Francisco" OR "Palo Alto" OR Piedmont)
site:ed.crossover.com "2 Hour Learning" (Guide OR Educator)
site:ed.crossover.com (Unbound OR "GT School") Guide
site:linkedin.com/jobs ("learning coach" OR "academic coach" OR Guide) (school OR K-8 OR K-12) ("San Francisco Bay Area" OR "East Bay" OR "Palo Alto")
site:linkedin.com/jobs ("Khan Lab School" OR "Acton Academy" OR Prisma) (coach OR guide OR educator OR mentor)
```

For 3c, drop Crossover results whose campus list has no Bay Area site. For 3a/3b, a Berkeley Montessori assistant is a hit even if it never mentions AI.

### Priority 4: Outdoor / Adventure / Climate Tech

Domain passion: companies where tech meets the outdoors. The API-queryable set is handled by `ashby-search` (+ greenhouse fallback); these queries catch the rest.

```
site:linkedin.com/jobs (Skydio OR Strava OR AllTrails OR "Pano AI" OR Saildrone OR "onX") engineer OR solutions OR data
site:boards.greenhouse.io saildroneinc OR onxmaps OR overstory OR carbonrobotics
site:jobs.lever.co alltrails
site:linkedin.com/jobs "climate tech" OR wildfire OR carbon "solutions engineer" OR "data" remote
site:linkedin.com/jobs (camping OR RV OR outdoor) SaaS sales engineer OR implementation
```

### Priority 5: Software Consulting

Client-facing software delivery — the direct extension of 3 years of consulting delivery at StaffRoom AI.
Three lanes, all in scope:

**5a. Boutique / mid-size product & dev shops**
```
site:linkedin.com/jobs (Thoughtworks OR Slalom OR "Nearform" OR "Bain" OR "software consultancy") engineer "San Francisco Bay Area" OR remote
site:linkedin.com/jobs "consulting engineer" OR "delivery engineer" software "San Francisco Bay Area"
site:linkedin.com/jobs "product engineer" consultancy OR "client projects" remote
```

**5b. Big 4 / large SI**
```
site:linkedin.com/jobs (Accenture OR "Deloitte Digital" OR "IBM Consulting" OR EY) "solutions engineer" OR "technology consultant" "San Francisco Bay Area"
site:linkedin.com/jobs "IBM Client Engineering" OR "Client Engineering" engineer
site:linkedin.com/jobs "management consultant" technology OR digital "San Francisco Bay Area"
```

**5c. AI-native consultancies (LLM / agent implementation for clients)**
```
site:linkedin.com/jobs "AI consultant" OR "automation consultant" remote OR "San Francisco"
site:linkedin.com/jobs "AI implementation" OR "LLM implementation" consultant OR engineer remote
site:linkedin.com/jobs "technical consultant" AI OR automation "San Francisco Bay Area"
site:linkedin.com/jobs "implementation engineer" OR "solutions architect" AI remote
```

### Priority 6: Data Analyst / Data Engineer (wider net)

```
site:linkedin.com/jobs "data engineer" Python SQL "San Francisco Bay Area" OR remote
site:linkedin.com/jobs "data analyst" Tableau OR BI "San Francisco Bay Area"
site:linkedin.com/jobs "analytics engineer" remote OR "San Francisco"
```

## Employer Exclusion Filter

Drop results from **deep tech / frontier AI labs and big tech** — Anthropic, OpenAI, Google/DeepMind,
Meta, Microsoft AI, xAI, Mistral, and peers. This is a **company-level** exclusion, not a title-level one:
"Forward Deployed Engineer" or "AI Solutions Engineer" is still a target title at a consultancy or an
outdoor company. Nature-oriented tech is *not* excluded even when it is technically deep — Skydio,
Saildrone, Pano AI, Carbon Robotics and similar stay in scope because the outdoor domain is the filter.

## Location Filter

When evaluating results, verify the job location fits:

**Educator lane** (on-site is the point):
- **Ideal:** East Bay schools (Emeryville, Berkeley, Oakland, Alameda, Piedmont, Albany) of any pedagogy
- **Acceptable:** San Francisco · Peninsula · South Bay · other SF Bay Area campuses
- **Too far / FAIL:** any school outside the Bay Area, even with relocation support

**Engineering / consulting lane:**
- **Ideal:** fully remote (US) · San Francisco / Emeryville / Oakland / Berkeley (East Bay)
- **Acceptable:** anywhere SF Bay Area hybrid (San Mateo, Palo Alto, San Jose, Alameda, Hayward)
- **Borderline:** Bay Area 5-days-onsite with a long commute from Emeryville (~60+ min)
- **Too far / FAIL:** anything requiring relocation out of the Bay Area (deal-breaker)

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape analyst" or "/scrape automation" -> Priority 1
- "/scrape educator" -> Priority 3 **all three buckets** (Montessori, traditional/independent/para/sub, and Alpha). Do not return only Crossover.
- "/scrape montessori" -> Priority 3a only
- "/scrape alpha" -> Priority 3c only
- "/scrape outdoor" -> Priority 4 queries + targeted `ashby-search --org` runs against the Tier 1/2 slugs in `documents/outdoor-target-companies.md`
- "/scrape gtm" -> Priority 2 queries with GTM Engineer / Solutions Engineer / Sales Engineer titles
