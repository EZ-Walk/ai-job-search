# ezwalker

Ethan Zaruba-Walker’s portfolio site ([zarubawalker.com](https://zarubawalker.com)) — Next.js App Router.

The app lives in `portfolio/` inside [EZ-Walk/ai-job-search](https://github.com/EZ-Walk/ai-job-search). It was moved off the `ezwalker` branch of `Staff-Room/MarketSense`.

## Deploy (Vercel)

| Setting | Value |
| --- | --- |
| Vercel project | [`ezwalker-portfolio`](https://vercel.com/zaruba-walker-consulting-llc/ezwalker-portfolio) |
| Git repository | `EZ-Walk/ai-job-search` |
| Production branch | `master` |
| Root directory | `portfolio` |
| Framework | Next.js |
| Live site | [zarubawalker.com](https://zarubawalker.com) |

## Notion project deep dives

Published rows in **Blog Entries** (`NOTION_BLOG_DATABASE_ID`) with `Status = Published` render at `/projects` and on the home **Featured projects** section.

Copy `.env.example` → `.env.local` and set `NOTION_TOKEN` (internal integration with access to the database). Page bodies are loaded via the public Notion read API (`notion-client` + `react-notion-x`); keep pages shared or public if rendering fails.

Optional: `REVALIDATE_SECRET` + `POST /api/revalidate?secret=…&slug=…` for on-demand cache busting after publish.

## Commands

From `portfolio/`:

```bash
npm install
npm run dev
npm run build
```

`npm run build` runs `scripts/generate-resume-pdf.mjs`, which compiles `resume/notion-native.tex` (compact-arial ATS layout) when `lualatex` is available. Vercel builds use the committed `public/ethan-zaruba-walker-resume.pdf` if TeX is not installed. Regenerate locally after editing the Notion-sourced `.tex` file.

## Notes

- `scripts/extract-to-own-repo.sh` is the old MarketSense-branch extractor. The source of truth is this folder.
- Custom domain `zarubawalker.com` is registered at GoDaddy. Vercel can attach it, but nameservers stay at GoDaddy until they are changed to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.
