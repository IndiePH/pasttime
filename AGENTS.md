# Pastime Project Context

## Project knowledge & codebase map

Before starting work, read these files for project context:

- `.planning/ROADMAP.md` — Milestone roadmap, phases, and progress
- `.planning/STATE.md` — Current phase, plan status, and session continuity
- `.planning/REQUIREMENTS.md` — Full requirement definitions
- `.planning/PROJECT.md` — Project overview and goals
- `.planning/phases/<phase-slug>/` — Phase context, plans, summaries, and specs
- `.planning/codebase/` — Architecture, conventions, integrations, stack, testing docs

Use `.planning/` as the single source of truth for project context.

## 🧠 Brain Directory — Agent Memory

`brain/` is a persistent wiki maintained by the agent as a second brain.
It caches research, decisions, patterns, and domain knowledge so the agent
doesn't re-fetch the web for things already learned.

### Schema & operations

Read `brain/schema.md` for the full contract. Rules:

1. **Always start by reading `brain/wiki/index.md`** — master page list with
   one-line summaries. Identify 1-3 relevant pages and read them before
   research or implementation work.

2. **Update the wiki when learning new things** — market research, design
   decisions, codebase patterns, architecture rationale, anti-patterns.
   One concept = one page. Keep pages focused (<400 lines).

3. **Use `brain/sources/` for raw reference** — immutable files never edited
   by the agent. Web research outputs, external docs, links, spec PDFs.
   Synthesize into wiki pages for active use.

4. **Cross-link pages** via `related:` fields in wiki page headers.
   Update `brain/wiki/index.md` when creating new pages.

5. **Don't re-fetch what's already cached** — if the wiki has a page on the
   topic you need, read it instead of hitting the web.

### Current wiki pages

| Page | Purpose |
|------|---------|
| [engineering-decisions](brain/wiki/engineering-decisions.md) | Architectural and tradeoff decision log |
| [nyt-engagement-patterns](brain/wiki/nyt-engagement-patterns.md) | NYT Games engagement features analysis |
| [percentile-ranking-patterns](brain/wiki/percentile-ranking-patterns.md) | Anonymous comparative ranking styles |

Add to this wiki as new knowledge is accumulated.
