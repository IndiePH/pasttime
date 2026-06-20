# Architecture

Reference inventory for the **pasttime** monorepo. The directional *rules* (layering, source-of-truth)
live in `AGENTS.md` → "Architecture guardrails"; this file holds the *descriptive inventory* of what
each app, package, and layer contains. Generated snapshots may also appear under `.planning/codebase/`
(gitignored, dated); when they conflict with code, code wins.

## Monorepo layout

npm workspaces. Workspace package names are scoped `@pasttime/*` but sources live under `packages/*`
and are consumed **source-first** (no build step): each package's `package.json` points
`main`/`types`/`exports` directly at `.ts` files. Next.js lists them in `transpilePackages`
(`next.config.ts`) so they compile with the app.

## Apps (`apps/*`)

| App | Stack | Role |
|-----|-------|------|
| `apps/web` | Next.js 16, App Router | The authoritative UI surface. |
| `apps/desktop` | Electron | Shell that loads the web URL (`PASTTIME_WEB_URL`). **No game logic.** |
| `apps/mobile` | Expo / React Native | API URL lives in `app.json` → `expo.extra.apiUrl` (not env). |
| `apps/server` | Node | REST + WebSocket multiplayer API (`src/index.ts`, `src/rooms.ts`). |

## Packages (`packages/*`)

- **`packages/domain`** — Game catalog + rules. **Framework-agnostic — must never import React.**
  Single source of truth for what a game *is*. Exposes subpath exports:
  - `@pasttime/domain`
  - `@pasttime/domain/daily`
  - `@pasttime/domain/games`
  - `@pasttime/domain/games/shared` (enriched dictionary: words + definitions + synonyms + antonyms)
  - `@pasttime/domain/games/*`
- **`packages/storage`** — Pluggable adapters: `createLocalStorageAdapter` (web),
  `createPersistedStorageAdapter` + `AsyncStorageLike` (RN). Both implement `StorageAdapter`.
- **`packages/api-client`** — Typed REST + WebSocket client shared by web and mobile.

## Web layer system (`apps/web/src/`)

Strict layering L0→L5 — dependencies point upward only (enforced as a guardrail in `AGENTS.md`):

```
lib (L0) → infrastructure (L1) → components (L3) → features (L4) → app/routes (L5)
                 platform (navigation abstractions)
```

| Layer | Path | Contents |
|-------|------|----------|
| L0 | `lib/` | `utils.ts` (`cn`, helpers), `pasttime-client.ts` (api-client wrapper). |
| L1 | `infrastructure/storage/` | `StorageProvider` context + `useStorage()` hook. |
| — | `platform/navigation/` | `PlatformLink`, `usePlatformRouter` (web/mobile abstraction). |
| L3 | `components/` | Shared UI: `ui/` (shadcn primitives), `ui/icons/`, `shared/`, `theme-provider`. |
| L4 | `features/` | `hub/` and `games/`. **All game UI lives here as plugins.** |
| L5 | `app/` | App Router routes only; thin wrappers around feature components. |

## Path aliases (`tsconfig.json`, mirrored in `vitest.config.ts`)

- `@/*` → `apps/web/src/*`
- `@pasttime/domain`, `@pasttime/storage`, `@pasttime/api-client` (+ `/*`) → `packages/*`

## Domain logic vs UI

Rules engines live in `packages/domain/games/<id>/` as **pure functions**
(e.g. `word-guess/game.ts` → `createWordGuessRound`, `submitWordGuessGuess`).
Hooks (`features/games/<id>/hooks/`) call domain functions and manage React state + persistence only.
**Never put rule logic in a `"use client"` file.**

## URL state (nuqs) — SSR/CSR alignment

Each game with query settings has `features/games/<id>/search-params.ts` exporting a
`<game>SearchParams` parser map (client) **and** a `<game>SearchParamsCache`
(`createSearchParamsCache` from `nuqs/server`). Defaults must come from the **domain** settings,
not be duplicated in components. The play/launch pages call
`parseGameSearchParams(slug, searchParams)` (`parse-game-search-params.ts`), which delegates to
`getGameModule(slug).parseSearchParams`. Defaults are wired via `.withDefault(...)` and
`.withOptions({ scroll: false, shallow: true })`.

## Persistence pattern

`useStorage()` returns a `StorageAdapter`. Persisted reads must be **validated** with a type guard /
`asStored*` parser (see `word-guess/persistence.ts`: `parseStoredWordGuessGame` returns `null` on bad
data). Invalid stored data → discard and start fresh, never throw. Storage key convention:
`<game-id>:<scope>:<mode>:...` (e.g. `word-guess:solo:...`). SSR note: `getStorage()` returns `null`
on the server. See `docs/QUALITY-CHECKLIST.md` Slice Q6.

## Testing

- **Vitest** with `jsdom` environment, setup `apps/web/vitest.setup.ts`.
- Tests are **co-located** as `*.test.ts` / `*.test.tsx` next to the code, picked up by
  `include: ["src/**/*.test.ts", "src/**/*.test.tsx"]`.
- Domain packages have their own `vitest.config.ts` and run pure-logic tests
  (`*.test.ts` in `packages/domain/games/**`) — this is where rule/engine coverage lives.
- Reference test suites to model new ones on:
  - `packages/domain/games/word-guess/{evaluate-guess,game,persistence}.test.ts`
  - `packages/domain/games/solitaire/klondike/game.test.ts`
  - `apps/web/src/features/games/word-guess/hooks/use-word-guess-game.test.tsx`
- Run a single package: `npm run test -w @pasttime/domain` / `-w @pasttime/web`.

## Conventions & gotchas

- **No semicolons, double quotes, 2-space, trailing-comma `es5`, LF endings, printWidth 80.**
  Prettier uses `prettier-plugin-tailwindcss` with `tailwindFunctions: ["cn", "cva"]` and
  `tailwindStylesheet: app/globals.css`. Run `npm run format`.
- **No `<style jsx>`** — enforced by ESLint `no-restricted-syntax` in `src/**`. Use Tailwind
  utilities, `globals.css`, or CSS files so components stay server-compatible.
- **Prefer `"use client"` only where needed** (hooks, contexts, interactive components).
  Server components are the default; `StorageProvider`, game hooks, etc. opt in.
- **Imports**: use `@pasttime/*` for packages (not relative `../../packages`), `@/*` inside web.
- React 19 / React DOM 19 and Expo/React-Native versions are **pinned via root `overrides`** —
  don't bump individually in workspace manifests.
- Root `optionalDependencies` carries platform-specific binaries
  (`@rolldown/binding-*`, `@tailwindcss/oxide-*`) for **both linux-x64 and win32-x64** — keep
  both platforms' binaries in sync when touching them (CI runs on linux; devs are on Windows).
- `postcss` is pinned to `8.5.10` via root override — don't let it drift.
- **Styling**: shadcn/ui (`components.json`, `radix-ui`) + Tailwind v4 (`@tailwindcss/postcss`).
- Legacy redirects in `next.config.ts` map `/games/sample-word*` → `/games/word-guess*`. Leave them.

## Project knowledge base (`brain/`)

`brain/` is a Claude-maintained wiki (see `brain/schema.md`).
- `brain/wiki/*.md` — editable wiki pages, each with a header
  (`updated:`, `tags:`, `related:`). **Always update `wiki/index.md` when adding a page.**
- `brain/sources/` — **read-only**. Never edit.
- When asked to "remember X", treat as an Ingest op (update the most specific existing page,
  cross-link via `related:`, never delete — deprecate with a note). `brain/wiki/engineering-decisions.md`
  is the ADR log (currently empty — append rows, don't rewrite).

## Skills directory (`skills/`)

Repo-local helper skills (image gen, OCR) under `skills/glm*/` with their own `SKILL.md` and Python
scripts. They are project tooling, not part of the app build.
