# Interview prep: Trail — Forward Deployed Engineer

**Stage:** Phone screen (first interview of this search)
**When:** 2026-11-11. Time of day not yet recorded.
**Format:** Phone
**Interviewer:** Utkarsh Phirke, Head of AI. Public profile: https://www.linkedin.com/in/utkarshphirke/
**Spelling:** Utkarsh, not Urkarsh. The LinkedIn URL is `utkarshphirke`.
**Posting:** https://jobs.ashbyhq.com/trailhq/49a83adf-28a7-456d-a3d0-25be6f34dc97
**What he has read:** `cv_draft.tex` and `cover_letter.tex` in this folder. Every number below is on those pages.
**Research refreshed:** 2026-11-10 against Trail's About, Context Graph, and Rule Engine pages; Utkarsh's public profile and post; Trail team FDE hiring posts; and current Glassdoor/Blind results.

No earlier-round feedback. This is the first conversation.

---

## What the Head of AI is actually testing

Utkarsh is not a recruiter screen. LinkedIn lists him as Head of AI at Nanonets since August 2022, based in Palo Alto, after Capital One (through Manager, Financial Services Strategy and AI product development, 2016–2022). Trail is a Nanonets product. A public org-chart aggregator lists him under the CEO with a small team. Treat the report count as unverified.

His May 2025 post is the brief for this call: using LLMs for routine tasks feels like magic until you automate something critical. He wrote that Nanonets learned that after processing over 1 billion documents.

He is deciding whether an FDE candidate can sit with a customer, pull the exceptions out of people's heads, write them so an agent can be held to them, build the workflow, and send the failure back to his AI team. He is not hiring a research scientist, and this phone call is not a coding round. He will smell-test judgment.

What he will push on:

1. **Critical vs demo.** Can you tell which step an agent must not finish alone? The product line is that every rule cites its source and a person approves it before it runs (trailhq.com). Your letter already claims that.
2. **The unwritten rule.** The about page says understanding a reconciliation workflow from inside the customer's building is still the fastest way to automate it. He will ask you to walk a real onboarding and name the constraint you found, not the one the customer opened with.
3. **Spec and build, same person.** The posting says translate problems into PRDs, workflows, and success criteria, and build them. Your letter promises both. He will ask which you actually did yourself.
4. **Signal back to AI.** The posting says collaborate with Product, Engineering, and Solutions to build platform features. He owns the AI. He will ask what you would hand his team after a deployment, and what you would leave as a customer-specific rule.
5. **Scale and solo habits.** Founder background is a plus on the posting. Three years alone, engagements up to $18K, is also the gap. Fortune 500 names on their about page (Volkswagen, Procter & Gamble, Ryanair) are not your clients. Do not borrow them.
6. **Language honesty.** Python, Go, or JavaScript. You have Python and JavaScript/TypeScript on the page. Go is absent. Say so if he asks. Do not study-bluff Go tonight.
7. **Decision plus build, without a handoff.** A September 29 post from Trail founding member Nithin Gadiparthi says the customer gives an FDE a messy problem, not requirements; the FDE decides what is worth solving, builds it, and checks whether it worked. Your answer is not "I wait for Product to write a PRD." You extract a testable spec from the customer's problem, then build against it yourself.

Likely shape of the hour: tell me about yourself, one process walkthrough, one "where did the agent have to stop," why Trail, why leave the company you still run, and what you want to know. Open with a short version of the letter. Let him pull depth.

---

## 1. Likely questions

### Motivation and timeline (phone screen)

**Tell me about yourself.** (60–90 seconds, same order as the letter)

"I'm in Emeryville, and two days a week in Palo Alto is a commute I can keep. For three years I've sold and delivered my own client work: first conversation, written spec, build, and production, with the customer still able to check the result. The failure I keep seeing is the one on your posting. Agents miss the call when they never get the rules and exceptions a team has built up. Before StaffRoom I spent more than two years as a software engineer in IBM customer support. I have not held the Forward Deployed Engineer title. The motion has been the same."

Stop. Let him choose the thread.

**Why Trail, specifically?**

Use only these, all checked on their site or his post:

- A rule cites the source text, and a person approves it before an agent can use it (homepage and the SOP upload flow).
- The failure mode is edge cases and rules that override each other. Their context-graph page shows a purchase order that stays under a credit limit, then a rush surcharge blows the limit two steps later because a flat prompt dropped the constraint. That is the bug you want to work on.
- The about page: the work is moving into the customer's building, and understanding the workflow from the inside is still the fastest way to automate it. That is the seat.
- His sentence, if it fits naturally: the magic stops when the process is critical. You have been on the customer side of that, at a smaller scale.

Do not quote 34% or 35% of the Fortune 500. The about page says 34%. The homepage says 35%. Skip the percentage. "10,000+ customers" is on the about page. "1B+ agent runs" is on the about page. His post says 1 billion documents. Those are different claims. If you cite him, say documents.

**Why leave StaffRoom?**

StaffRoom is still running. This is a move toward a team, not away from a failed company. Solo engagements top out at $18K. The processes on your about page, reconciliation and the rules that contradict each other, are the same motion at a depth one person cannot productize. You want the pattern from one onboarding to land in the platform, which is the third bullet of the posting.

Do not talk about teaching, schools, or a different target company.

**Walk me through a customer onboarding.** Use the MSP story below.

**Where did you refuse to let the system decide?** Use the 95% content-scoring story below.

**What would you hand my team after a deployment?**

One customer-specific rule stays in their graph, cited to their document, approved by their operator. The repeated failure, the class of exception you saw twice, is the platform note: a missing edge type, a bad default, a success check the product should ship. You already wrote a version of this on the CV: "Feed what customers hit in onboarding back as the next build."

**When do you configure a customer manually, and when do you build something reusable?**

This is almost verbatim from Trail's public FDE hiring post. Start with the deadline and uncertainty. Configure by hand when you are still learning the process or the customer needs a safe result now. Build the reusable path once the repeated step, input, and evaluation criterion are clear. Your StaffRoom version is: discover the seized-up step, write the success criterion, ship the narrow workflow, then turn repeated onboarding failures into the backlog. Do not claim you built Trail's example of an assistant that configures agents and runs evals.

### Gaps he will probe

**You have not been an FDE. You have not deployed at Volkswagen scale.**

Acknowledge it. The letter already does. Bridge: IBM customer support was the large organization. StaffRoom was the full loop on a small book. You have not owned a Fortune 500 accounts-payable or claims deployment. The adjacent work is an MSP's pre-sales risk assessment, a content evaluation held to human agreement, clinical notes into a data model, and federal case documents for a nonprofit. The scale of the customer's process is what you are here to learn. Do not imply those clients were enterprises of Trail's size.

**You don't have Go.**

"Go is not a language I have shipped. Python is the one I reach for. JavaScript, TypeScript, and MCP servers are in production, which is what the CV says. If a customer workflow is Go, I would ramp on their repo with someone who owns it, and I would not pretend the first onboarding is mine to rewrite in a language I am learning that week."

**You don't know accounts payable, claims, or order management.**

True. Trail's context-graph examples are a credit limit, a GL rule, and a payer requirement. You have not implemented those. You have implemented the shape: a rule with an exception, a human check, and a measured before-and-after. Ask him which process the current FDEs are actually in. That is better than faking a domain.

**Three years solo. The posting asks for humble and collaborative.**

"The last three years I was the team. That is a real gap. What I practiced is writing the spec another person could hold the build to, training the operator to extend it, and keeping a backlog after handover. I want the seat where Product and Engineering are in the room, because the repeated exception should become their feature, not my next solo project."

**How technical are you, really?**

He may ask you to go one level down, not to code. Be ready to explain, in plain language:

- A success criterion you set before the build (95% agreement with human reviewers, from their ground truth, not from the model's opinion of itself).
- Why the scoring model and the generation model were separated, if he asks how you avoided a model grading its own homework. That detail is behind the CV bullet. It is not a new metric.
- MCP as a way to point an agent at a system the customer already uses. Trail's homepage says they ship an MCP server. You have shipped MCP servers. Say what yours did (tool access for a real workflow), not their architecture.

Do not claim you have used Trail or trail-code. You have not.

### If he goes deeper than a screen

**Rules that override each other.** Their page: a flat prompt resolves a credit limit, then a later surcharge exceeds it. Your answer: you would write both constraints down before the build, name which one wins, and put a check at the end that re-reads every rule, because the failure shows up on the last step. A person approves the rule. You do not need their graph vocabulary to say that. If you use "node" and "edge," use them as their words, not as a claim you have built this.

**What does production mean to you?** A workflow on the customer's real records, with a measured baseline, a human who can still reject the output, and someone on their side trained to change it. A demo on sample data is not production. The CV says you held builds to milestone acceptance and a human check.

---

## 2. STAR answers

`07-interview-prep.md` still has empty stubs for these. The drafts below use only the candidate profile and the submitted CV. They are for this interview. They are not added to the framework unless you say so.

### MSP pre-sales risk assessments (onboarding, the constraint, enablement)

**Use for:** "Walk me through an onboarding," "tell me about a time you found the real problem," "how do you leave the customer able to run it."

**S:** An IT managed service provider was doing pre-sales cybersecurity risk assessments by hand. The slow step was inside the sales motion, so it taxed every deal, not a back-office queue.
**T:** You owned the engagement: find the constraint, automate that step, and leave them able to extend it. This is the 98% processing-time bullet.
**A:** You surfaced the constraint in the first conversations rather than automating the step they named first. You automated the manual step, then trained the team to extend the workflow. Python is the language you reach for on these builds.
**R:** Processing time fell 98%. The result you defend is the time drop plus a team that could change the workflow after you left. If he asks what the manual step literally was and you cannot picture it cold, say you want to describe it accurately and go one level down only as far as you remember. Do not invent the click-path.

### Content-scoring evaluation (the human check)

**Use for:** "How do you know an agent is right," "tell me about a success criterion," "when do you refuse to ship."

**S:** A client needed content scored against what their own reviewers already considered good. A model grading its own drafts would have been a false success.
**T:** Ship only if the scores agreed with human reviewers. The CV states 95%.
**A:** You designed the evaluation from their ground truth. The scoring path was separate from the generation path, so the model was not marking its own homework. People approved before the score counted. Rubrics were something the client could revisit, not a prompt buried in a demo.
**R:** Human-reviewer agreement reached 95%, and that was the bar to ship. The CV does not name the client. Lead with the work. Name the engagement only if he asks which client and you are comfortable doing so.

### Ingestion modernization (the number he may pick off the page)

**Use for:** "Biggest measured change," "a multi-month delivery."

**S:** A data-analytics platform's ingestion path was the bottleneck.
**T:** You owned a four-month modernization.
**A:** You modernized the pipeline. Stay at the level on the CV unless he asks for the design. Do not add a stack he cannot find on the page.
**R:** Throughput increased 99.8% in four months. Cost fell 86%.

### DRE Bot (end-to-end inside a large support org)

**Use for:** "Have you done this inside a real company, not only your own," "a tool people actually used."

**S:** IBM customer support engineers were re-solving issues the organization had already seen. You were a data engineer and cognitive software engineer there from August 2018 to December 2020.
**T:** Get the prior answer in front of the engineer on the ticket they were already in.
**A:** You built DRE Bot, a Watson NLP Slack app, and led the design sessions that turned the need into the build. Common issues were the ones that kept coming back.
**R:** On those repeat tickets, resolution went from a multi-touch case to one response. If he asks for the measurement method, the profile's basis is team check-ins over three months, not a published study. Say that if asked. Do not upgrade it.

### What not to tell

- Wiz Music is not a growth story. Do not bring it up.
- Do not cite a fraternity, a sailboat, or EMT unless he asks how you spend your time. This call is about the work.
- Valhalla is an F1 of 80.03 on handwritten clinical notes, one customer on the interface, not a team you trained. Use it only if he asks about a harder modeling problem. Do not lead with it.
- No quota, no Go, no Fortune 500 logo, no "I have been an FDE."

---

## 3. Consistency brief

If it is not on the CV or the letter, do not introduce it as a result. If it is on the page, be able to go one level down.

| Claim on the page | If he pulls the thread |
| --- | --- |
| Engagements up to $18K, sourced and scoped by you | What a statement of work contained. How many you ran at once: do not invent a count. "A small book of concurrent, milestone-gated engagements" is as far as the paper goes. |
| Workflows, success criteria, milestone acceptance, then Python | Read one acceptance criterion out loud from memory. |
| MSP, 98% less processing time, you trained them to extend it | The STAR above. |
| Content scoring, 95% agreement with human reviewers | Ground truth, separate scorer, people approved. |
| Python, TypeScript, JSON APIs, Git, MCP. Claude Code drives the LLM work | One MCP server you shipped and what tool it exposed. Claude Code is your daily driver, which the CV already says. Trail-code supports Claude Code. You have not used Trail-code. |
| Ingestion, +99.8% throughput in four months, −86% cost | The number and the time box. Design only if you can draw it without new facts. |
| Notion content system, 10x agency volume, you trained the producers | Discovery, the operating workflow, enablement. 10x is volume, not revenue. |
| EZ-AI, problem-first fluency so operators can judge and extend the system | Adult operators, not a school. Four threads if he asks: judgment stays with the person, their own patterns, precise requests, a 70% draft as a starting point. |
| Anti-trafficking nonprofit, federal case documents, a client-facing dashboard | Messy source documents, a person still looking at the dashboard. Do not invent a model metric. The CV does not state one. |
| IBM, August 2018–December 2020, DRE Bot, IBMLogAnalyze (1–3 hours of prep to zero), C-level Tableau and Cognos | You were an engineer in the support org, not a quota seller. GDPR-compliant pipelines: say what you actually constrained if you remember it. Do not invent a control. |
| Valhalla intern, May–August 2021, F1 80.03 | Internship. One customer on the interface. |
| "I have not held the Forward Deployed Engineer title" | He will respect that you already said it. Repeat it once, then the motion. |
| Two days a week in Palo Alto, based in Emeryville | You already told them the commute works. Do not renegotiate it on this call. |
| Spanish, conversational | Only if useful. Do not force it. |
| IBM Systems & Solutions Architecture certificate, completed 2026 | Business process modeling and requirements. Relevant if he asks how you write a process down. It is not a substitute for a customer deployment. |

Letter claims to be ready to defend in his words: PRD the build is held to, success criterion, milestone acceptance, pattern brought back to Product, Engineering, and Solutions.

---

## 4. Tough questions

**Why this company?** See the four hooks above. One sentence he should hear: you want the job of getting a critical process's exceptions into a form an agent can cite, with a person still approving the rule.

**Why did you leave / why now?** StaffRoom continues. You want the same loop on processes that should change the product, not only the one client.

**Five years.** Still close to the customer. The repeated exception has become a platform behavior other FDEs do not have to rediscover. You are not pitching a move into people management or a research lab. You have not managed a team.

**Biggest weakness.** "Breadth. I have shipped across a lot of tools, and the last three years I chose the stack myself. The mitigation is that Python is the language on the critical path, the spec is written so someone else can hold me to it, and I would rather learn Trail's graph from your team than invent a parallel one."

**You are a founder. Will you stay?** "I am applying for the seat, not a tour. The consultancy was the place I learned the loop. I want that loop inside a team whose product outlives one engagement."

**Any reservations about the role?** Hybrid two days in Palo Alto is already accepted in the letter. A real reservation you can say out loud: you have not yet seen how an FDE's week splits between customer building and internal platform work, and you want the customer process to stay the majority. Ask him. Do not invent a complaint from anonymous reviews.

**Compensation, if he asks.** The posting lists base $130,000–$160,000 plus equity and benefits. Say that band is what you applied against and it is workable. Do not name a single number on a first call unless he requires one. If he requires one, the bottom of a conversation is the posted band, not a figure below it and not a dream number.

---

## 5. Questions to ask

Ask four. Save the rest if he offers time. Do not ask what the site already answers: what Trail is, whether rules cite a source, whether the role is hybrid, or whether they have an MCP server.

1. "When a rule you learn at a customer contradicts another rule mid-process, what do you want an FDE to bring back to you, and what should stay in that customer's graph?"
2. "What does a failed first deployment look like in the first 90 days?"
3. "Which processes are still too critical for an agent to finish alone, and how do you want the FDE to draw that line on site?"
4. "On a live onboarding, who owns the success criterion: the FDE, Solutions, or the customer's operator?"
5. "Your team has written about choosing between configuring an agent by hand for a deadline and building a reusable setup-and-eval path. What tells you an FDE made that tradeoff well?"
6. "After this call, who is the next conversation, and what will they be testing?"

Glassdoor and Blind, as of this prep, are a small set of anonymous reviews that disagree with each other: high marks for pay and talented peers, and complaints about stress, metrics, and management. Do not quote them. Question 2 is how you learn what the week actually rewards.

No personal contact at Trail is on file.

---

## 6. Logistics

- Phone. November 11, 2026. Confirm the time and whose number dials.
- Have this page open. Water nearby.
- Smile while you talk. It changes the voice on a phone.
- Five seconds of silence before a story is fine. "Let me pick the right engagement" is better than the wrong one.
- If a question is vague, ask whether he wants the customer moment, the build, or the check at the end.
- Close with: "Is there anything else you'd like to know about my background?"
- Thank-you note the same day. Two or three sentences. Mention the specific process he spent time on, not a generic "great to meet you."

**Company facts safe to say**

- Trail is the context layer Nanonets is selling. Nanonets is now Trail on their own Ashby postings. Founded 2017, Y Combinator W17, San Francisco. About page: Series A $10M led by Elevation (2022), Series B $29M led by Accel (2024). Founders Sarthak Jain (CEO) and Prathamesh Juvatkar (CTO).
- About page: work is in finance, healthcare, logistics, and manufacturing, increasingly in the customer's building. Named customers there: Volkswagen, Procter & Gamble, Ryanair.
- Homepage: SOP in, rules traced to the page they came from, a person approves, then it runs. Connects to agents through MCP, retrievers, or REST/GraphQL. SOC 2 Type II, GDPR, ISO 27001, HIPAA BAA on enterprise plans, as published on the homepage.
- Trail's public FDE hiring explanation says the customer supplies a messy problem, not requirements; the FDE decides what is worth solving, builds it, and checks whether it worked. It also names the manual-configuration versus reusable-automation tradeoff. Use this as a question or answer frame, not as a claim about your own Trail experience.
- Do not recite the ComplexConstraints leaderboard (45.0% / 40.4% / 38.7%) unless you have actually read https://nanonets.com/products/context-graph and can explain the credit-limit example in your own words. The example is the hook. The leaderboard is optional.

**Interviewer angle**

Head of AI, ex-Capital One, four years in this company's AI org. He will care whether you make his models survivable on a process the customer can lose money on. He will care less about your coursework and your community stories. Speak to him as the person who has watched a demo fail in production.
