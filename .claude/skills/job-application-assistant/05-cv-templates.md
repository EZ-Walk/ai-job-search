---
framework_version: 1.0.0
---

# CV Templates and Tailoring Guide

<!-- BEGIN ACTIVE-TEMPLATE (managed by /add-template - do not edit by hand) -->
> **Active template override: `compact-arial`**
>
> A custom template is active. Where this block conflicts with the stock guidance below, this block wins. Structural advice below (tailoring, page-budget, cutting rules) still applies.
>
> - **Template skeleton:** `templates/cv/compact-arial/template.tex` — use this as the structural reference instead of the stock template
> - **Manifest:** `templates/cv/compact-arial/TEMPLATE.md` — read this for style rules and known pitfalls before drafting
> - **Compile with:** `lualatex` (not the engine named in the stock guidance below)
> - **Fonts:** Arial (system font on macOS; TeX Gyre Heros fallback), letter paper, 0.5in margins, 10pt, no icon fonts
> - **Page limit:** exactly 1 page. Last line of content must sit in the bottom inch; a large empty footer is a fail. Continuation lines with only a few words are a fail (see `templates/cv/compact-arial/TEMPLATE.md`)
> - **Output file:** `cv/main_<company>_<role>.tex` / `cover_letters/cover_<company>_<role>.tex` (never `cv/main_<company>.tex`; that path cannot hold two roles at the same company). Copy any class/font files the template needs into the output directory, or reference them by relative path
<!-- END ACTIVE-TEMPLATE -->

<!-- SETUP: Profile statements and section ordering are personalized by running /setup -->

## Template: LaTeX moderncv (Banking Style)

All CVs use the moderncv LaTeX package with the "banking" style and "blue" color scheme.

**Output file:** `cv/main_<company>_<role>.tex` (never `cv/main_<company>.tex`; one company can have multiple roles)
**Compile with:** **lualatex** on MiKTeX/TeX Live. pdflatex often fails on modern MiKTeX installs with `fontawesome5` font-expansion errors; lualatex handles the same sources cleanly.
**Master reference:** `cv/main_example.tex` (comprehensive CV with all competencies, experience, and achievements - use as source when building targeted CVs)

### Compile command

```bash
cd cv && lualatex -interaction=nonstopmode main_<company>_<role>.tex
```

Expected output: `Output written on main_<company>_<role>.pdf (2 pages, ...)`. Any page count other than 2 is a failure that must be fixed before presenting to the user.

## Document Structure

```latex
\documentclass[11pt,a4paper,sans]{moderncv}
\moderncvstyle{banking}
\moderncvcolor{blue}

% Force both first and last name AND section headings to render in moderncv
% blue (color1). Default banking on lualatex+MiKTeX leaves these black, which
% looks inconsistent with the rest of the blue accent scheme.
\renewcommand*{\firstnamestyle}[1]{{\fontsize{34}{36}\bfseries\upshape\color{color1}#1}}
\renewcommand*{\lastnamestyle}[1]{{\fontsize{34}{36}\bfseries\upshape\color{color1}#1}}
\renewcommand*{\sectionstyle}[1]{{\sectionfont\color{color1}#1}}

\usepackage[utf8]{inputenc}
\usepackage{hyperref}
\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,
    urlcolor=blue,
    pdftitle={[YOUR_NAME] - CV},
    pdfpagemode=FullScreen,
}
\usepackage[scale=0.77]{geometry}
\usepackage{import}

% Personal data
\name{[FIRST_NAME]}{[LAST_NAME]}
\address{[YOUR_ADDRESS]}{}{}
\phone[mobile]{[YOUR_PHONE]}
\email{[YOUR_EMAIL]}
\extrainfo{\href{[YOUR_LINKEDIN_URL]}{LinkedIn}, \href{[YOUR_GITHUB_URL]}{GitHub}}

\begin{document}
\makecvtitle

% 1. Profile statement (1-3 sentences, tailored per role)
% 2. Skills section
% 3. Education section
% 4. Professional Experience section
% 5. Selected Publications (if applicable)
% 6. Honors and Awards (if applicable)
% 7. References

\end{document}
```

### Color overrides

The three `\renewcommand*` lines in the preamble are required on lualatex+MiKTeX. Without them the firstname, lastname, and section headings render in black even though `\moderncvcolor{blue}` is set, which looks inconsistent with the rest of the blue accent scheme (links, bullet markers, contact icons). The override forces all three to use `color1` (moderncv's accent colour, which becomes blue under `\moderncvcolor{blue}`). Both names render bold; if you prefer the firstname in regular weight, change the firstnamestyle override from `\bfseries` to `\mdseries`. Don't drop the override - on most modern installs the defaults render visibly wrong.

### Spacing inside itemize lists (important)

**Do not place `\vspace{...}` between `\item` entries in an `itemize` list.** Even though the source looks symmetric, this pattern occasionally produces a noticeably oversized gap before a single item: the inter-item `\vspace` creates a paragraph break that interacts unpredictably with the list's internal `\itemsep`, so LaTeX renders one of the gaps wider than the rest. Remove the inter-item `\vspace` and let `itemize` use its native uniform spacing.

```latex
% WRONG - intermittently produces an oversized gap before one bullet
\begin{itemize}
\item \textbf{Foo}: ...
\vspace{1pt}
\item \textbf{Bar}: ...
\vspace{1pt}
\item \textbf{Baz}: ...
\end{itemize}

% RIGHT - uniform spacing using the list's native itemsep
\begin{itemize}
\item \textbf{Foo}: ...
\item \textbf{Bar}: ...
\item \textbf{Baz}: ...
\end{itemize}
```

Two related patterns are fine and should be kept:
- `\vspace{1pt}` immediately after `\section{...}` (between section heading and first item) - this is between the heading and the list, not between list items.
- `\vspace{3pt}` between top-level `\cventry` blocks in Professional Experience or Education - this gives breathing room between roles and renders consistently.

## Section-by-Section Tailoring

### Profile Statement / Elevator Pitch (Best Practice)
This is the most important section to customize. It appears right after `\makecvtitle`.

Write 5-7 lines that function as an "elevator pitch": a concise, compelling introduction explaining why you're qualified for *this specific role*. Focus on what the employer gains from hiring you.

**Create 2-3 profile statement templates for your main role types:**

<!-- Populated by /setup (Path A) on 2026-07-15 from past CV drafts -->

**For AI engineering / solutions consulting roles:** *[Used for: IBM Client Engineering — Horizon Market, 2026]*
> Builder-seller: ex-IBM data & AI engineer who runs discovery with stakeholders and ships working pilots fast. 3 years of AI consulting experience running engagements end-to-end (discovery contracts, SOWs, milestone-gated delivery), building AI-powered business systems with a human-in-the-loop approach.

**For Developer Relations / Developer Experience roles:** *[Used for: Notion Developer Advocate, 2026]*
> Builder and technical communicator with 8 years building developer-facing tools, docs, and AI integrations, including production Notion API systems across OAuth Connections, webhooks, data sources, and workflow automation. Grew a creator community abroad, shipped ML tools non-experts could actually use, and runs an AI consultancy from a 1966 sailboat on the SF Bay.

**For backend / Python engineering roles:** *[Used for: Makai Labs Senior Python Developer, 2025]*
> Versatile Python developer with 7+ years of experience specializing in Flask microservices and backend development. Experienced at building AI applications that support human workflows with a human-in-the-loop approach. Skilled at translating complex client requirements into scalable, maintainable applications.

**For data analyst / analytics roles:** *[Used for: Deloitte / Makai Data Analyst, 2024-2025]*
> Data analyst focused on using data to drive business impact: BI dashboards for C-level executives, SQL data platforms that automate hours of manual work, and AI-assisted analysis pipelines. Pairs technical delivery (Python, SQL, Tableau) with Design Thinking discovery sessions and stakeholder alignment.

**For Guide / educator roles at AI-native schools:** *[Added /setup 2026-08-31 — Alpha / 2 Hour Learning. No K-12 classroom tenure; do not imply any.]*
> AI practitioner who already treats software as the tutor and the adult as the coach. Delivered EZ-AI, problem-first fluency training for domain experts. Cognitive Science certificate. Used to 1:1 goal-setting, enabling non-experts, and keeping humans as the decision-makers. Applying to Guide-style roles where academics run in adaptive software and the job is motivation, life skills, and relationships.

**For Montessori, independent, and traditional school roles:** *[Added /setup 2026-08-31. Use this, not the Alpha statement, unless the posting is actually Alpha-style.]*
> Cognitive Science background and a habit of 1:1 enablement: making a hard skill learnable, then stepping back. Delivered EZ-AI as problem-first training for adults. No classroom credential and no years as teacher of record. Applying for assistant, Guide, para, after-school, or uncredentialed associate roles where presence, patience, and clear explanations matter more than a lesson-plan archive.

### Core Competencies / Skills Section (Best Practice)
Reorder and emphasize based on the role. Use bold category labels.

List **5-7 key competencies** in bullet format, tailored to the specific job. For each competency, briefly explain how it adds value to the position.

### Education
- Always include your highest degrees
- For senior roles, keep education brief (dates and titles only)
- Include thesis topics when relevant to the target role

### Professional Experience
- Rewrite bullet points to emphasize aspects most relevant to the target role
- Use 4-6 bullets for most recent role, 3-4 for previous, 2-3 for older (compact-arial: 5-8 / 1-3 if the page has room)
- **Emphasize measurable results** where possible: "Reduced processing time by X%", "Model adopted by the team"
- Consulting / StaffRoom bullets follow `03-writing-style.md` Bullet Point Style: one engagement, action then outcome, no glued "separately" lines, no client product names the reader does not know. Bookend the repeating method (discovery; stay after launch) as its own bullets, then put each proof in the middle.

### Named company notes

**Backroads:** first-party intel (Sep 2026, director of rooming ops). Building custom in-house software and becoming data-driven. For every Backroads role (guest services, hotel ops, demand planning, sales ops, and future reqs): keep analysis, operational reporting, process mapping, and custom internal-tool work on the CV. Guest-facing postings still lead with communication, intake, and matching, but do not delete IBMLogAnalyze-style internal tools, Tableau/Cognos, or pipeline/process metrics to look "safer." Do not invent names for their internal products. Do not put the director on the CV; a cover letter may reference the conversation if Ethan wants that.

### Handling Employment Gaps (Best Practice)
If there is a gap in your employment history:
- The gap should be explained matter-of-factly if needed
- Describe how professional development continued during the gap
- Frame as deliberate skill-building and career repositioning

### Publications
- Include Google Scholar link if applicable
- Select 3-4 most relevant publications (not always all of them)
- For non-academic roles, keep brief

### Honors and Awards
- Keep format brief, one line each

### References
- List 2-4 references with name, title, company, and contact
- End with: "More references are available upon request."
- **Do not attach reference letters** - employers typically contact references directly

## Compile-and-Inspect Loop (MANDATORY)

After writing the CV and before presenting to the user, always compile and visually inspect the PDF. Iterate until the layout is clean. Workflow:

1. Run `lualatex -interaction=nonstopmode main_<company>_<role>.tex`
2. Check the output page count: compact-arial **exactly 1 page**; stock moderncv **exactly 2 pages**
3. Read the PDF via the Read tool and visually inspect every page
4. Check for **orphaned entries**: a job/education title line must never sit alone at the bottom of a page with its bullets on the next page
5. **compact-arial layout fails** (do not present until these pass):
   - **Large empty footer:** last line of content must sit in the bottom inch. A wide white band under Skills is a fail; add true content and recompile.
   - **Orphan wrap lines:** a continuation line with only a few words (`anything.`, `98%.`, `team.`) is a fail. Shorten to one full line, or add enough true content that the second line is at least half a line. Inspect the PDF, not the `.tex`.

### Fixing common page-break problems

**Problem: entry title on page 1, bullets orphaned to page 2**
Add `\needspace{5\baselineskip}` immediately before the problematic `\cventry`:
```latex
\needspace{5\baselineskip}
\item{\cventry{YEAR--YEAR}{Role Title}{Organization}{Location}{}{...}}
```
Include `\usepackage{needspace}` in the preamble.

**Problem: one trailing section spills to page 3 (e.g., References alone on page 3)**
Add `\enlargethispage{2-3\baselineskip}` before a late section (e.g., before `\section{Honors and Awards}`) to stretch page 2 by a few lines. This is the standard LaTeX rescue for near-miss overflows.

**Problem: 3 pages with significant content on page 3**
Cut content — do not compress geometry or `\vspace`. See "Relevance-weighted cutting" below for the rule.

**Problem: content finishes early on page 2 (feels thin)**
Restore the highest-relevance item that was previously cut — a CV that ends mid-page 2 looks incomplete.

**Problem: compact-arial 1-page CV with a large empty footer**
Add a true bullet, an older role, or a skill line. Do not squeeze geometry. Recompile and inspect the PDF.

**Problem: a bullet wraps with only a couple of words on the next line**
Rewrite the bullet so it fits on one line, or add enough true content to fill the second line. A hanging `anything.` / `98%.` / `team.` is wasted width.

## ATS Parseability

Most employers run CVs through an ATS before a human sees them, and the ATS reads the PDF's embedded **text layer**, not the rendered page. A CV can pass visual inspection and still extract as garbage. After the layout passes the compile-and-inspect loop, verify the text layer:

```bash
cd cv && pdftotext -layout main_<company>_<role>.pdf main_<company>_<role>.txt
```

`pdftotext` comes from [poppler](https://poppler.freedesktop.org/), not the TeX distribution - it is an **optional** dependency. If it is not installed, skip the mechanical check with a warning and rely on the visual PDF read for keyword coverage.

What to check in the extraction:

- **Contact details as literal text.** The stock template's fontawesome contact icons extract as glyph names (`MOBILE-ALT`, `Envelope`) - harmless noise, because the actual address and number are printed beside them. The failure mode is a contact detail carried *only* by an icon or a hyperlink (like the `LinkedIn` link text, whose URL is not in the text layer): invisible to an ATS. The email address must always appear as printed text.
- **No garbled output.** `(cid:NNN)` markers or `�` characters mean a font is embedded without a Unicode mapping - an ATS sees the same garbage. This shows up with unusual fonts in custom templates, not with the stock moderncv setup under lualatex.
- **Reading order.** The stock banking style is single-column, so extraction order matches visual order. Custom templates (via `/add-template`) with sidebars or multi-column layouts can interleave unrelated lines; if extraction order is scrambled, the user is trading ATS compatibility for looks and should be told.
- **Keyword coverage.** Match the posting's required/preferred terms against the extracted text, in the posting's language. Prefer the posting's exact term over a synonym when it is truthfully applicable - ATS matching is often literal. Never add a keyword the profile does not support.

## Page Budget - Hard 2-Page Limit

The CV **must** fit on exactly 2 pages when compiled. Use these content limits as a guide:

| Section | Max budget |
|---------|-----------|
| Profile statement | 3-4 lines |
| Skills | 5 items, each 1-2 lines |
| Most recent role | 4-5 bullets |
| Previous role | 2-3 bullets |
| Older roles | 2 bullets (1 line each) |
| Education | 2-3 entries |
| Publications | 2-3 entries |
| Awards | 3 entries, single line each |
| References | "Available upon request." (single line) |

**If in doubt, cut rather than squeeze.** Reducing `\vspace` or geometry scale to force-fit content makes the CV look cramped.

## Relevance-weighted cutting (the right way to shrink a CV)

**Cut by signal, not by section.** Static priority lists ("remove oldest education first, then shorten the earliest role...") are wrong when a relevant "lower-priority" item is competing with an irrelevant "higher-priority" item. An older-role bullet that speaks directly to the posting is worth more than a recent-role bullet that does not.

For every candidate line, score three things:

1. **Relevance to THIS posting** — does the line hit a named tool, keyword, or stated responsibility in the job ad?
2. **Uniqueness** — is it the only place this claim appears, or is it duplicated elsewhere in the CV?
3. **Narrative load** — does the cover letter depend on it? If cutting the line would force you to rewrite a cover-letter paragraph, it is load-bearing.

Cut the lowest-total-score line first, regardless of which section it sits in.

### Practical order of cuts (easiest → last resort)

1. **Redundancy.** If an achievement appears in both Core Competencies AND a role bullet, the Core Competencies version is usually the cleaner cut (the experience bullet is more concrete evidence).
2. **Profile-statement fluff.** A sentence that just restates what Publications or Skills will show. ("Peer-reviewed publications on X..." is already a Publications entry — profile can claim it once and stop.)
3. **Low-relevance experience bullets.** A bullet about work that does not touch posting keywords, wherever it sits. This cuts across sections before touching the structural list.
4. **Low-relevance supporting content.** An older-role bullet that does not speak to the target role. A certification that does not touch the posting's stack. A language entry that can be condensed to one line.
5. **Low-relevance publications.** Keep 1-2 publications that best match the posting. Cut the rest before touching experience bullets.
6. **Last-resort structural cuts.** Oldest education entry, tightening an older role to 2 bullets, collapsing Certifications into a single line. These only happen if the relevance-weighted cuts above have already been exhausted.

### Pitfalls to avoid

- Do not mechanically cut from the bottom of a static section list without checking relevance. "Cut the oldest role first" is wrong if that role is literally about the skill the posting asks for.
- Do not cut the one concrete example the cover letter leans on. Relevance is measured against the cover letter you wrote, not just the job posting — interviewers will have read both.
- Do not cut to fit if the fit is borderline (2.02 pages). Prefer `\enlargethispage{2-3\baselineskip}` on a late section for near-misses; reserve content cuts for genuine overflow (content on page 3 that is more than a single trailing section).

## Recommended Section Order

The section order varies by role type:

**For technical / data science / ML roles:**
1. Profile statement / elevator pitch
2. Core competencies / Skills
3. Professional Experience (reverse chronological)
4. Education (reverse chronological)
5. Languages
6. Publications & Awards
7. References

**For domain-specific / specialist roles:**
1. Profile statement / elevator pitch
2. Core competencies / Skills
3. Education (reverse chronological) - credentials are a key qualifier
4. Professional Experience (reverse chronological)
5. Publications & Awards
6. References
