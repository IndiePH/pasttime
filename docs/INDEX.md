# Pasttime — File Index

A flat, navigable index of the **pasttime** monorepo: a cross-platform games hub
(web, desktop, mobile, multiplayer server). Updated 2026-06-17.

Legend: ✅ implemented/available · 🚧 coming soon / scaffold · ⚙️ engine/package

---

## Table of contents

1. [Root](#1-root)
2. [Apps](#2-apps)
   - [apps/web](#appsweb)
   - [apps/desktop](#appsdesktop)
   - [apps/mobile](#appsmobile)
   - [apps/server](#appsserver)
3. [Packages](#3-packages)
   - [packages/domain](#packagesdomain)
   - [packages/storage](#packagesstorage)
   - [packages/api-client](#packagesapi-client)
4. [Docs](#4-docs)
5. [Game modules](#5-game-modules)
6. [Platform coverage matrix](#6-platform-coverage-matrix)

---

## 1. Root

| File | Purpose |
|------|---------|
| `package.json` | Workspace root, shared scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `server:*`, `desktop:*`, `mobile:*`), dependency overrides |
| `package-lock.json` | Lockfile |
| `.nvmrc` | Node version pin (≥24) |
| `.gitignore` / `.prettierignore` / `.prettierrc` | Git + formatting config |
| `.env.example` | Root env template |
| `README.md` | Project overview, layout, scripts |
| `__pr_body.md` | PR description template |
| `.github/workflows/ci.yml` | CI: ci → lint → typecheck → test → build |

---

## 2. Apps

### apps/web

Next.js primary app. The authoritative game UI surface. Layers (L0→L5):
`lib` → `infrastructure` → `components` → `features` → `app`.

**Config & build**
| Path | Purpose |
|------|---------|
| `apps/web/package.json` | Workspace manifest |
| `apps/web/tsconfig.json` | TS config |
| `apps/web/next.config.ts` | Next.js config |
| `apps/web/postcss.config.mjs` | PostCSS (Tailwind) |
| `apps/web/eslint.config.mjs` | ESLint flat config |
| `apps/web/components.json` | shadcn/ui config |
| `apps/web/wrangler.jsonc` | Cloudflare Workers deployment |
| `apps/web/open-next.config.ts` | OpenNext (SSR on Cloudflare) |
| `apps/web/vitest.config.ts` / `vitest.setup.ts` | Test setup |
| `apps/web/.env.example` | Env template |

**L5 — Routes** (`src/app/`)
| Path | Purpose |
|------|---------|
| `layout.tsx` / `page.tsx` | Root layout + home |
| `globals.css` / `loading.tsx` / `global-error.tsx` | Global styles + error/loading shells |
| `games/page.tsx` | Games hub |
| `games/[slug]/page.tsx` | Game landing |
| `games/[slug]/play/page.tsx` | Game play |
| `games/[slug]/room/[code]/page.tsx` | Multiplayer room |
| `games/[slug]/{loading,error,not-found}.tsx` | Route segments |
| `about/`, `contact/`, `download/`, `privacy/`, `terms/` | Static pages |
| `favicon.ico` | Favicon |

**L3 — Shared UI** (`src/components/`)
| Path | Purpose |
|------|---------|
| `shared/` | `site-shell`, `header`, `footer`, `game-card`, `game-launch-actions`, `ad-panel`, `feedback-widget`, `mode-toggle`, `static-page`, `trust-badges`, `index` |
| `ui/` | shadcn primitives: `badge`, `button`, `card`, `dialog`, `dropdown-menu` |
| `ui/icons/` | `game-icon`, `word-guess-icon`, `sample-{crew,grid,quiz,tiles}-icon`, `index` |
| `theme-provider.tsx` | Theme context |

**L4 — Features** (`src/features/`)
| Path | Purpose |
|------|---------|
| `hub/` | Hub page: `hub-hero`, `hub-catalog`, `hub-filter`, `hub-games-section`, `hub-game-search`, `search-params`, `index` |
| `games/` | Game plugin system (see [§5](#5-game-modules)) |
| → `games/components/` | Shared game shells: `game-page-shell`, `game-play-shell`, `game-play-section`, `game-play-view`, `game-play-settings`, `game-play-footer-actions`, `game-content-panel`, `game-session-header`, `game-launch-settings`, `game-how-to-play(-placeholder)`, `game-settings-widget`, `game-settings-placeholder`, `join-room-panel`, `room-lobby-view`, `settings-toggle-field`, `index` |
| → `games/cards/` | Card-skin prefs: `card-game-preferences`, `card-skin-picker`, `use-card-game-preferences` |
| → `games/hooks/` | `use-move-queue`, `use-room-lobby` |
| → `games/` (registry glue) | `module-registry`, `game-settings-registry`, `game-play-settings-registry`, `game-how-to-play-registry`, `registered-game-settings`, `registered-game-play-settings`, `registered-how-to-play-content`, `parse-game-search-params`, `index` |
| → `games/solitaire/` | ✅ Klondike (see [§5](#5-game-modules)) |
| → `games/word-guess/` | ✅ Word Guess (see [§5](#5-game-modules)) |
| → `games/crossword/` | ✅ Crossword (see [§5](#5-game-modules)) |

**L0–L2 — Platform & infra** (`src/`)
| Path | Purpose |
|------|---------|
| `lib/pasttime-client.ts` | API client wrapper |
| `lib/utils.ts` | `cn` + helpers |
| `infrastructure/storage/` | `storage-provider`, `index` |
| `platform/navigation/` | `platform-link`, `use-platform-router`, `index` |
| `hooks/` | `.gitkeep` (reserved) |

**Scripts & assets** (`apps/web/`)
| Path | Purpose |
|------|---------|
| `scripts/word-guess/build-dictionary.mjs` | Corpus → `games/shared/dictionary.target.json` |
| `public/_headers` | Cloudflare headers |
| `public/games/cards/minimal/` | 54 card SVGs (back light/dark + 13 ranks × 4 suits) |
| `public/.gitkeep` | Keeps dir |

---

### apps/desktop

Electron shell that loads the web app.

| Path | Purpose |
|------|---------|
| `src/main.ts` | Electron main process |
| `src/preload.ts` | Preload bridge |
| `tsconfig.main.json` | Main-process TS config |
| `package.json` | Workspace manifest |

---

### apps/mobile

Expo / React Native client.

| Path | Purpose |
|------|---------|
| `app/_layout.tsx` / `app/index.tsx` | Root layout + home |
| `app/games/[slug]/index.tsx` | Game landing |
| `app/games/[slug]/play.tsx` | Game play |
| `app/games/[slug]/room/[code].tsx` | Multiplayer room |
| `lib/api.ts` | API calls |
| `lib/storage.ts` | Local persistence |
| `app.json` | Expo config (incl. `expo.extra.apiUrl`) |
| `babel.config.js` / `metro.config.js` / `tsconfig.json` | Build config |
| `package.json` / `.gitignore` | Manifest |

---

### apps/server

REST + WebSocket multiplayer API.

| Path | Purpose |
|------|---------|
| `src/index.ts` | HTTP + WS server entry |
| `src/rooms.ts` | Room lifecycle / state |
| `tsconfig.json` / `package.json` | Build config |

---

## 3. Packages

### packages/domain

Framework-agnostic game catalog & rules (no React). The single source of truth
for what a game *is*.

**Root**
| Path | Purpose |
|------|---------|
| `index.ts` | Barrel: re-exports `daily`, `games`, `games/crossword` |
| `package.json` / `tsconfig.json` / `vitest.config.ts` | Build/test config |

**Catalog & shared** (`games/`)
| Path | Purpose |
|------|---------|
| `registry.ts` | ⚙️ `GAME_REGISTRY`, `getGameById`, filter/sort/featured helpers |
| `types.ts` | `GameDefinition`, `GameStatus`, etc. |
| `paths.ts` | Route-path helpers |
| `status-filter.ts` | Hub status filter logic |
| `room-code.ts` | Room code generation/validation |
| `card-interaction.ts` / `card-theme.ts` / `playing-cards.ts` | Shared card primitives |
| `index.ts` | Barrel |

**Daily**
| Path | Purpose |
|------|---------|
| `daily/index.ts` / `daily/seed.ts` | Daily challenge + seeding |

**Game: solitaire (Klondike)** ✅
| Path | Purpose |
|------|---------|
| `games/solitaire/index.ts` | Barrel |
| `games/solitaire/modes.ts` | Klondike/Pyramid/TriPeaks/FreeCell… mode defs |
| `games/solitaire/paths.ts` | Route paths |
| `games/solitaire/klondike/types.ts` | Game types |
| `games/solitaire/klondike/deck.ts` | Deck creation/shuffle |
| `games/solitaire/klondike/deal.ts` | Deal layout |
| `games/solitaire/klondike/card-utils.ts` | Card helpers |
| `games/solitaire/klondike/rules.ts` | Move legality |
| `games/solitaire/klondike/game.ts` | Game engine |
| `games/solitaire/klondike/game.test.ts` | Engine tests |
| `games/solitaire/klondike/index.ts` | Barrel |

**Game: word-guess** ✅
| Path | Purpose |
|------|---------|
| `games/word-guess/index.ts` | Barrel |
| `games/word-guess/types.ts` | Game types |
| `games/word-guess/settings.ts` | Settings schema |
| `games/word-guess/paths.ts` | Route paths |
| `games/word-guess/pick-target-word.ts` | Target selection |
| `games/word-guess/dictionary.ts` | Dictionary loader |
| `games/shared/dictionary.target.json` | Built word list (shared across games) |
| `games/word-guess/evaluate-guess.ts` | Letter-grade logic |
| `games/word-guess/evaluate-guess.test.ts` | Tests |
| `games/word-guess/game.ts` / `game.test.ts` | Game engine + tests |
| `games/word-guess/persistence.ts` / `persistence.test.ts` | Save/restore |

**Game: crossword** ✅ (new — untracked)
| Path | Purpose |
|------|---------|
| `games/crossword/index.ts` | Barrel |
| `games/crossword/types.ts` | Grid/cell/clue types |
| `games/crossword/settings.ts` | Settings schema |
| `games/crossword/paths.ts` | Route paths |
| `games/crossword/clues.json` | Puzzle clue bank |

---

### packages/storage

Pluggable persistence adapters.

| Path | Purpose |
|------|---------|
| `index.ts` | Barrel |
| `types.ts` | Adapter interfaces |
| `local-storage-adapter.ts` | Browser localStorage |
| `async-storage-adapter.ts` | React Native AsyncStorage |
| `package.json` / `tsconfig.json` | Config |

---

### packages/api-client

Typed REST + WebSocket multiplayer client (shared web/mobile).

| Path | Purpose |
|------|---------|
| `index.ts` | Barrel |
| `client.ts` | REST + WS client impl |
| `types.ts` | Request/response types |
| `package.json` / `tsconfig.json` | Config |

---

## 4. Docs

| File | Purpose |
|------|---------|
| `docs/DESIGN.md` | Design direction |
| `docs/IMPLEMENTATION.md` | Implementation slices |
| `docs/QUALITY-CHECKLIST.md` | Quality checklist |
| `docs/GAMES.md` | Game catalog overview |
| `docs/SOLITAIRE.md` | Solitaire spec |
| `docs/CARD-ASSETS.md` | Card SVG asset spec |
| `docs/DEPLOY.md` | Cloudflare deploy + data-build scripts |
| `docs/CONTENT-STORAGE-HANDOFF.md` | R2 + D1 lexicon migration plan (Worker size) |
| `docs/INDEX.md` | This file |

---

## 5. Game modules

Each game is a **plugin**: domain logic in `packages/domain/games/<game>/` and a
UI module registered in `apps/web/src/features/games/module-registry.ts`
(`GAME_MODULES`). A module may supply `LaunchView`, `PlayView`,
`SettingsWidget`, `HowToPlayContent`, `playLayout`, and `parseSearchParams`.

| Game | Status | Domain | Web UI | Web registry keys |
|------|--------|--------|--------|-------------------|
| **Solitaire (Klondike)** | ✅ | `games/solitaire/klondike/*` | `features/games/solitaire/` | `LaunchView`, `PlayView`, `SettingsWidget`, `playLayout: board` |
| **Word Guess** | ✅ | `games/word-guess/*` | `features/games/word-guess/` | `LaunchView`, `PlayView`, `SettingsWidget`, `HowToPlayContent` |
| **Crossword** | ✅ (new) | `games/crossword/*` | `features/games/crossword/` | `LaunchView`, `PlayView`, `SettingsWidget`, `HowToPlayContent`, `playLayout: board` |
| Tongits | 🚧 | — | — | catalog only |
| Pusoy Dos | 🚧 | — | — | catalog only |
| Sudoku | 🚧 | — | — | catalog only |
| Reversi | 🚧 | — | — | catalog only |
| Fleet Grid | 🚧 | — | — | catalog only |
| Spades | 🚧 | — | — | catalog only |
| Word Factory | 🚧 | — | — | catalog only |
| Type Rush | 🚧 | — | — | catalog only |
| Type Shield | 🚧 | — | — | catalog only |
| Tile Words | 🚧 | — | — | catalog only |

**Solitaire web UI** (`features/games/solitaire/`)
- `components/`: `klondike-board`, `klondike-drag-overlay`, `klondike-fly-overlay`, `klondike-play-card`, `playing-card`, `solitaire-launch-actions`, `solitaire-launch-view`, `solitaire-mode-picker`, `solitaire-play-settings-widget`, `solitaire-play-view`, `solitaire-settings-widget`, `index`
- `hooks/`: `use-klondike-drag`, `use-klondike-foundation-fly`, `use-klondike-game`, `use-solitaire-play-preferences`
- `context/solitaire-play-preferences-context.tsx`
- `lib/`: `klondike-foundation-fly`, `klondike-pile-geometry`
- `search-params.ts`, `solitaire-play-preferences.ts`

**Word Guess web UI** (`features/games/word-guess/`)
- `components/`: `word-board-preview`, `word-guess-board`, `word-guess-how-to-play`, `word-guess-keyboard`, `word-guess-launch-actions`, `word-guess-launch-view`, `word-guess-mode-picker`, `word-guess-play-settings-widget`, `word-guess-play-view`, `word-guess-settings-widget`, `word-guess-tile`, `word-length-picker`, `index`
- `hooks/`: `use-word-guess-game` (+ `.test.tsx`), `use-word-guess-daily-completed`
- `search-params.ts`, `index.ts`

**Crossword web UI** (`features/games/crossword/`) — *untracked*
- `components/`: `crossword-grid`, `crossword-how-to-play`, `crossword-launch-view`, `crossword-mode-picker`, `crossword-play-settings-widget`, `crossword-play-view`, `crossword-settings-widget`, `index`
- `hooks/use-crossword-game.ts`
- `search-params.ts`, `index.ts`

---

## 6. Platform coverage matrix

| Surface | Games hub | Play | Multiplayer room | Domain rules |
|---------|:---------:|:----:|:----------------:|:------------:|
| Web (`apps/web`) | ✅ | ✅ | ✅ | via `@pasttime/domain` |
| Desktop (`apps/desktop`) | ✅ loads web | ✅ | ✅ | via web |
| Mobile (`apps/mobile`) | ✅ | ✅ | ✅ | via `@pasttime/domain` |
| Server (`apps/server`) | — | — | ✅ host | — |

**Cross-cutting packages:** `@pasttime/domain` (rules, no React) → consumed by
web + mobile + (indirectly) desktop. `@pasttime/api-client` → web + mobile.
`@pasttime/storage` → web (`local`) + mobile (`async`).
