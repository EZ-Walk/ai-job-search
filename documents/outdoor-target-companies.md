# Outdoor & Tech-Forward Target Companies

> Research compiled 2026-07-15. Focus: tech-forward, outdoor/adventure/climate companies for a
> candidate with **AI/automation + GTM/SDR/BDR + some ML** background. Bay Area preferred, remote-US OK.
> Job counts are point-in-time (2026-07-15) and drift — re-run the skill for live numbers.

## How to use this file
- **Queryable** companies (Ashby / Greenhouse) can be polled automatically. Ashby ones are seeded in
  `.agents/skills/ashby-search/cli/src/helpers.ts`; Greenhouse ones in
  `.agents/skills/greenhouse-search/cli/src/helpers.ts`. Both surface via `/scrape`.
- **Manual** companies (Workday / Lever / Rippling / custom) need a careers-page visit or LinkedIn.
- Run a targeted live search, e.g.:
  `bun run .agents/skills/ashby-search/cli/src/cli.ts search -q "sales" --org skydio,pano-ai,patch.io --format table`
  `bun run .agents/skills/greenhouse-search/cli/src/cli.ts search -q "engineer" --org saildroneinc,onxmaps,overstory --format table`

---

## ⭐ Tier 1 — Apply first (Bay Area · real GTM roles · hiring now · queryable)

| Company | HQ | Why it fits | Board (slug) | ~Jobs |
|---|---|---|---|---|
| **Skydio** | San Mateo 🟢 | Autonomous drones (outdoor HW + ML). Open **GTM Engineer, Solutions Engineer, RevOps** — best title match. | Ashby `skydio` | ~93–108 |
| **Pano AI** | San Francisco 🟢 | Wildfire-detection CV. **Enterprise AE, Strategic Accounts, CSM** — dual GTM + ML story. | Ashby `pano-ai` | ~15 |
| **Patch** | San Francisco 🟢 | Carbon-credit API. **4× Enterprise AE** — purest GTM opening. | Ashby `patch.io` | ~13 |
| **Strava** | San Francisco 🟢 | Fitness/outdoor platform. Real ML/data + marketing-analytics roles. | Ashby `strava` | ~30 |

## 💪 Tier 2 — Strong (remote-US GTM, or Bay Area with an ML lean)

| Company | HQ | Fit | Board (slug) | ~Jobs |
|---|---|---|---|---|
| **Overstory** | remote-US | *Enterprise CSM – SF Bay Area* + ML; satellite wildfire risk for utilities | Greenhouse `overstory` | ~12 |
| **The Dyrt** | Portland / remote | *Senior Sales Executive* — camping-discovery platform, pure GTM | Breezy `the-dyrt` | — |
| **Eight Sleep** | NY + SF | Has real **BDR/BD** roles + ML; sleep hardware | Ashby `eightsleep` | ~49 |
| **Sofar Ocean** | San Francisco 🟢 | Ocean-sensor network + Wayfinder SaaS; ML-lead + some GTM/SE | Ashby `sofarocean` | ~7 |
| **Watershed** | San Francisco 🟢 | Climate platform, ~24 US roles | Ashby `watershed` | ~42 |
| **Tonal** | San Francisco 🟢 | Connected strength hardware; data/ML (lean hiring now) | Ashby `tonal` | ~17 |

## 🔬 Tier 3 — ML / engineering lane (lead with ML, not the SDR title)

| Company | HQ | Board (slug) | ~Jobs | Note |
|---|---|---|---|---|
| **Saildrone** | Alameda 🟢 | Greenhouse `saildroneinc` | ~24 | Uncrewed ocean vehicles; Staff ML SWE, Mission Solutions. Thin GTM. |
| **Carbon Robotics** | Seattle | Greenhouse `carbonrobotics` | ~17 | LaserWeeder CV robot; all-eng right now. |
| **Whoop** | Boston | Ashby `whoop` | ~156 | Deepest named ML/DS org; big 2026 hiring surge. |
| **onX Maps / Backcountry** | Missoula MT | Greenhouse `onxmaps` | ~25 | Backcountry ski/hike/climb nav; data/ML + growth. |
| **Bedrock Ocean** | Palo Alto 🟢 | Ashby `bedrockocean` | ~1 | Seabed mapping AUV; eng/data. |
| **Chestnut Carbon** | NY / SE | Ashby `chestnut` | ~4 | Afforestation (Microsoft offtake); Product & Commercial Lead (remote). |
| **Zydro Marine** | Newton MA | Ashby `zydro` | ~3 | Marine-autonomy stack; robotics/geospatial SWE. |
| **Sylvera** | London | Ashby `sylvera` | ~2 | Carbon ratings + ML; London-only now (poor geo-fit). |
| **Mast Reforestation** | Seattle | Ashby `mast` | ~1 | Drone-seeding + carbon; GTM/data when posted. |

## ⏰ Watch / set-an-alert (real target, no open reqs today)

| Company | HQ | Board | State |
|---|---|---|---|
| **AllTrails** | San Francisco 🟢 | Lever `alltrails` | Board live but **0 reqs**. 2025 ML "Peak" push — check weekly. |
| **Saildrone** talent net | Alameda 🟢 | JobScore (secondary) | Use Greenhouse `saildroneinc` for live reqs. |
| **Vibrant Planet** | Truckee/Tahoe 🟢 | site (ATS unconfirmed) | "Land Tender" wildfire SaaS; gov/utility sales + geospatial. |
| **NCX** | San Francisco 🟢 | ncx.com/careers | Carbon marketplace; landowner/enterprise sales + data. |

## 🏕️ Camping / RV B2B SaaS — strong SDR/BDR/SE fit (manual apply)
These *sell software to operators* — the purest match for an SDR/BDR sales motion. ATS not on a public API
under standard slugs (likely HubSpot/custom) — apply via careers page / LinkedIn.

- **RoverPass** (Austin) — campground/RV-park reservation SaaS + OTA marketplace.
- **Staylist** — next-gen campground/RV booking + PMS SaaS, revenue-optimization focus.
- **Newbook** (AU, US ops) — PMS/reservation software for RV parks & hospitality.

## 🥾 Guided / active travel (manual apply — named priority)
- **Backroads** (Berkeley 🟢) — guided active-travel (bike/hike/multisport). Workday board (`/BR`), no public API,
  so check the careers page directly. Named by the candidate as a focus target; East Bay HQ is an ideal commute.
  **Positioning (Sep 2026, first-party):** a director of rooming ops said they are building custom in-house
  software and becoming much more data-driven. On every Backroads CV, keep analysis and systems experience
  visible. Do not strip IBMLogAnalyze, Tableau/Cognos, pipelines, or process mapping to look like a generic
  guest-services hire. Do not invent names for their internal products.

## 🧭 Other net-new outdoor apps (mostly small / non-API / manual)
57hours (guided-adventure marketplace, remote — BD/growth) · KAYA Climb ("Strava for climbing") ·
Fishbrain (fishing app, Stockholm) · Natural Atlas (trail/GPS data) · Ride with GPS (Portland — email apply) ·
Slopes (ski tracking, indie) · HuntStand · onWater · Verdant Robotics (Hayward 🟢) · Bonsai Robotics (San Jose 🟢) ·
Electric Sheep (SF 🟢, outdoor-maintenance robotics).

---

## ATS / queryability reference (verified live 2026-07-15)

| ATS | Public API? | Companies here |
|---|---|---|
| **Ashby** | ✅ clean JSON (`api.ashbyhq.com/posting-api/job-board/<slug>`) | Skydio, Strava, Whoop, Eight Sleep, Tonal, Rothys, Pano AI (`pano-ai`), Patch (`patch.io`), Sofar Ocean, Watershed, Chestnut, Bedrock Ocean, Zydro, Mast, Sylvera |
| **Greenhouse** | ✅ (`boards-api.greenhouse.io/v1/boards/<slug>/jobs`) | Saildrone (`saildroneinc`), onX Maps (`onxmaps`), Peak Design (`peakdesign`), Overstory (`overstory`), Carbon Robotics (`carbonrobotics`) |
| **Lever** | ✅ (`api.lever.co/v0/postings/<slug>`) | AllTrails (`alltrails`, empty now) |
| **Breezy** | partial | The Dyrt (`the-dyrt`) |
| **Workday** | ❌ no clean public API | Backroads (`/BR`), YETI, Patagonia, Hydro Flask, Dick's/Public Lands |
| **Rippling** | ⚠️ limited | Hipcamp |
| **iCIMS / JazzHR / custom** | ❌ | REI (iCIMS), Cotopaxi (JazzHR, retail only), Garmin/Wahoo/COROS (custom), Outdoorsy (self-hosted) |

### Not recommended for this profile (surfaced but filtered out)
Peak Design (great brand, ~65 ppl, no software/data org) · On Running / Arc'teryx / COROS / Suunto (tech-light) ·
Hydro Flask, Rumpl, Outdoor Voices, Fjällräven (traditional CPG/DTC, no tech org) ·
Public Lands (gutted to ~3 stores — target parent Dick's data org instead, but no Bay Area / no GTM) ·
Pachama (acquired by Carbon Direct Nov 2025 — look at Carbon Direct).

---

## Key takeaways
1. **The outdoor sector is ATS-fragmented** — no single API covers it. Ashby + Greenhouse together reach the
   API-queryable ~20; the legacy names (AllTrails-Lever, Backroads-Workday, Hipcamp-Rippling) need manual checks.
2. **Best automatable pipeline ≈ best role-fit set** — the climate/wildfire/robotics cluster (Skydio, Pano,
   Patch, Overstory, Saildrone) is young enough to be API-queryable *and* has genuine GTM roles. Lucky alignment.
3. **AllTrails (your #1) is empty today** — not closed. It's on Lever; monitor it.
4. **Skydio is the single strongest title-match** (GTM Engineer / Solutions Engineer / RevOps), Bay Area, hiring now.
