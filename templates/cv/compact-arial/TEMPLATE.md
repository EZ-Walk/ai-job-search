# Template: compact-arial

- **Type:** CV
- **Engine:** lualatex
- **Page limit:** 1 page
- **Fonts:** Arial (system font on macOS; falls back to TeX Gyre Heros if Arial is missing)
- **Class/packages:** `article` + `fontspec`, `geometry`, `hyperref`, `setspace` (TeX Live basic). Do not add `enumitem` or `titlesec`; they are missing from TeX Live basic. Use the `cvitems` list environment from the skeleton.

## Compile command

    cd cv && lualatex -interaction=nonstopmode main_<company>_<role>.tex

## Style rules

- Letter paper, 0.5in margins, 10pt Arial, black on white. No color scheme, no icon fonts, no profile blurb. A compact SKILLS block at the bottom is welcome when it fills leftover space.
- Header: name centered, large bold. Contact line centered underneath, hyphen-separated **literal** email, phone, and full URLs (`linkedin.com/in/...`, `github.com/...`), not the words "LinkedIn" / "GitHub".
- Section order: EXPERIENCE then EDUCATION. Add SKILLS and extra posting-relevant bullets whenever the page would otherwise end with a large bottom gap. Certifications can sit under Education. Skip "References available upon request."
- Section headings: ALL CAPS bold, immediately followed by a full-width horizontal rule.
- Each role: company bold left / location right; italic title left / dates right. Date format `Month Year - Month Year` or `Month Year - Present`.
- Bullets: hyphen label (`-`), tight spacing. Most recent role 5-8 bullets if the page has room; older roles 1-3. Lead with posting-relevant work, not a summary paragraph. One engagement per bullet: action, period, then the outcome. Do not glue two projects with "separately" or lead with a client product name the reader does not know. Diction: every word is a skill, tool, or outcome. Named practices ("Active listening, process mapping"), never a scene ("Sit with the people who do the work").
- Single column only. Do not introduce a sidebar. Print every contact detail as visible text (ATS).
- Hard 1-page limit. Fill leftover space with words before stopping. **A large empty footer is a failure.** After compile, the last line of content must sit in the bottom inch of the page (inside the 0.5in margin). If you can fit two fingers of white under Skills, add a true bullet, an older role, or a skill line and recompile. Do not present the PDF until that gap is gone. Cut with relevance-weighted cutting only when content overflows to page 2. Never squeeze geometry to force a fit.
- **No orphan wrap lines.** A continuation line with only a few words (`anything.`, `98%.`, `team.`) is wasted width and a fail. After compile, every bullet is either one full line or two lines with the second at least half a line. Shorten to fit one line, or add enough true content to fill the second. Do not leave the wrap and call it done.

## Known pitfalls

- Arial must be installed (macOS ships it). If compile fails on fontspec, TeX Gyre Heros is the fallback; check the log for `fontspec` errors.
- TeX Live basic does not include `enumitem` or `titlesec`. Keep using `cvitems` (a kernel `list`).
- Output lives in `cv/`. The skeleton is self-contained (no extra `.cls` to copy).
- Do not wrap this layout in moderncv. `\cventry` / banking style is the old stock template.
- Contact URLs must appear as the URL text. A hyperlink whose visible text is only "LinkedIn" is invisible to ATS.
- This template is denser than moderncv. A 2-page banking CV will overflow; cut, do not switch back to 2 pages unless the user asks.
