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
| [adsense-manual-units](brain/wiki/adsense-manual-units.md) | AdSense slots, apex vs gamehub domains, ads.txt/CMP/review |
| [classic-game-conventions](brain/wiki/classic-game-conventions.md) | Solitaire/Word Guess conventions and innovation ideas |
| [dictionary-pipeline](brain/wiki/dictionary-pipeline.md) | Dictionary, crossword corpus, and definition pipeline |
| [engineering-decisions](brain/wiki/engineering-decisions.md) | Architectural and tradeoff decision log |
| [nyt-engagement-patterns](brain/wiki/nyt-engagement-patterns.md) | NYT Games engagement features analysis |
| [percentile-ranking-patterns](brain/wiki/percentile-ranking-patterns.md) | Anonymous comparative ranking styles |

Add to this wiki as new knowledge is accumulated.

## Cursor Cloud specific instructions

Node version gotcha: this repo requires Node >=24 (`.nvmrc` = 24), but the VM's
`/exec-daemon` directory injects Node 22 ahead of nvm in `PATH`. The agent's
`~/.bashrc` prepends any installed Node 24 toolchain so interactive login shells
resolve `node`/`npm` to v24 automatically. If you spawn a non-login shell and see
Node 22, either start a login shell (`bash -l`) or run
`export PATH="$HOME/.nvm/versions/node/v24.*/bin:$PATH"`.

Services (all commands run from repo root; see README "Scripts" table):
- Web (`@pasttime/web`, Next.js) is the primary app — `npm run dev` on
  http://localhost:3000. This is the only service needed to play the games
  (crossword, solitaire, word guess); games are anonymous/localStorage-backed.
- Multiplayer API (`@pasttime/server`, Express + WS) is optional —
  `npm run server:dev` on http://localhost:4000 (`/health` returns `{"ok":true}`).
  Only needed for live room sync; set `NEXT_PUBLIC_API_URL=http://localhost:4000`
  in `apps/web/.env.local` to wire the web app to it.
- Desktop (Electron) just loads the web URL; Mobile is Expo. Neither is needed to
  exercise core gameplay.

Quality gates (match CI in `.github/workflows/ci.yml`): `npm run lint`,
`npm run typecheck`, `npm run test`, `npm run build`. `lint`/`build` target only
the web app; `typecheck`/`test` run across all workspaces.

The `npm ci`/`npm install` "allow-scripts ... not yet covered" warnings (esbuild,
sharp, workerd, etc.) are informational only — the required prebuilt binaries are
installed and tests/dev server work; no `npm approve-scripts` step is needed.
