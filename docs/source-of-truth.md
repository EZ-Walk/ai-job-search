# Source of truth across agent runtimes

Goal: one version-controlled home for the job search that Cursor cloud agents, Grokbot, and Notion can all read, plus a separate public place to share framework improvements.

## Two repos, one direction of flow

| Repo | Visibility | Holds | Who reads it |
|---|---|---|---|
| `ai-job-search-private` | private | Everything: CV, cover letters, `documents/applications/**`, `job_search_tracker.csv`, profile, interview prep | Cursor, Grokbot, Notion, you |
| `EZ-Walk/ai-job-search` (the public fork) | public | Framework only: skills, tools, templates, docs, tests | Community, upstream `ai-job-search-dev/ai-job-search` |

Why not make the current fork private: GitHub does not allow a fork of a public repo to be made private. A fork also keeps its public history, so personal files already committed here stay visible in old commits even after deletion. The private repo has to be a new repo.

## One-time migration

1. Create an empty private repo `EZ-Walk/ai-job-search-private` (no README).
2. From a clone of this repo:
   ```bash
   git remote rename origin public
   git remote add origin git@github.com:EZ-Walk/ai-job-search-private.git
   git push -u origin --all
   ```
3. In the private repo, delete the "Personal job search tracking" block (`job_search_tracker.csv`) from `.gitignore` and commit the tracker. Agents can then see status without a paste step.
4. Point every runtime at the private repo:
   - Cursor: add the repo to the cloud agent environment and grant the GitHub app access.
   - Grokbot: clone with a fine-grained token scoped to that repo, read/write on contents.
   - Notion: link or sync the repo, or have a Notion agent read `job_search_tracker.csv` and `documents/applications/*/outcome.md`.
5. Treat the public fork's `master` as a framework mirror. Stop pushing personal commits to it.
6. Optional cleanup: if the exposure matters, delete and re-fork the public repo. This removes the personal history from it. Anything already scraped or cloned cannot be recalled.

## Conventions so multiple agents stay consistent

- `job_search_tracker.csv` is the status index and `outcome.md` per application is the detail. Every runtime updates both and commits.
- Agents work on a branch and open a PR to `master`, or push small commits to `master` for tracker-only edits. Pick one rule and keep it. Concurrent edits to the CSV are the most likely conflict, so keep one row per application and append notes rather than reformatting.
- No secrets in the repo. Tokens live in each runtime's secret store.

## Contributing back publicly

Framework changes (skills, tools, templates, tests, docs) go to the public fork through a clean branch based on the public `master`, never from the private history.

```bash
git fetch public
git checkout -b contrib/<topic> public/master
git cherry-pick <framework-only commits from private>   # or copy the files by hand
git push public contrib/<topic>
```

Open the PR to `ai-job-search-dev/ai-job-search` from there. Keep commits that touch only framework paths separate from commits that touch personal data, so cherry-picking stays easy. A "how I use this" write-up belongs in `docs/` of the public repo with names, employers, and numbers generalized.
