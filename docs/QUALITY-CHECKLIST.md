# Quality checklist

Concrete gates for **maintainability**, **stability**, **integrity**, and **safety**, mapped to [implementation slices](./IMPLEMENTATION.md).

Use this before merging features, promoting a game to `available`, or cutting a release.

---

## Quick verify (every PR)

Run locally (same steps as [CI](../.github/workflows/ci.yml)):

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

| Check | Command / location | Pass criteria |
|-------|-------------------|---------------|
| Lint | `npm run lint` | Zero errors |
| Types | `npm run typecheck` | Zero errors |
| Unit tests | `npm run test` | All green |
| Production build | `npm run build` | Succeeds |
| No styled-jsx | ESLint `no-restricted-syntax` | No violations in `src/**` |

---

## Slice Q1 — CI pipeline ✅

**Goal:** Main branch cannot merge with broken lint, types, tests, or build.

- [x] Add `.github/workflows/ci.yml` (or equivalent) on `push` + `pull_request`
- [x] Job steps: `npm ci` → `lint` → `typecheck` → `test` → `build`
- [x] Pin Node to `.nvmrc` / `package.json` `engines`
- [x] Document CI in [README](../README.md) scripts table
- [ ] (Optional) `npm audit --audit-level=high` as non-blocking or weekly job

**DoD:** A failing test blocks merge; contributors see CI status on PRs. *(Requires branch protection on `main` in GitHub repo settings.)*

---

## Slice Q2 — Registry and catalog integrity

**Goal:** Hub cards, routes, and modules tell the same story.

### Per game (before `status: "available"`)

- [ ] Entry in `src/domain/games/registry.ts` with correct `status`
- [ ] Icon ID wired in `src/components/ui/icons/game-icon.tsx`
- [ ] `GAME_MODULES` entry in `src/features/games/module-registry.ts` with `LaunchView` + `PlayView` (and settings/how-to as needed)
- [ ] `docs/GAMES.md` row updated (`legalStatus`, viability note)
- [ ] Launch route `/games/[slug]` renders game module (not generic shell only)
- [ ] Play route `/games/[slug]/play` renders real gameplay or intentional placeholder copy
- [ ] Invalid slug → `notFound()` (already on routes)

### Known fixes (track until done)

- [ ] **Crossword:** `available` in registry but no module — set `coming_soon` or add module + play UI
- [ ] **Solitaire:** play UI beyond placeholder before treating as fully live
- [ ] Hub filter `?status=available` only lists games that pass checks above

**DoD:** No `available` game without a registered module and honest play experience.

---

## Slice Q3 — Game module pattern (maintainability)

**Goal:** New games do not grow central `if (slug)` switches.

### Adding a game (extends [IMPLEMENTATION.md](./IMPLEMENTATION.md#adding-a-game-after-slice-2))

1. [ ] `docs/GAMES.md` checklist complete
2. [ ] `src/domain/games/<id>/` — rules, types, settings (no React)
3. [ ] `src/features/games/<id>/` — UI + hooks
4. [ ] Register in `module-registry.ts`
5. [ ] Search params: `features/games/<id>/search-params.ts` + register parser (see Q4)
6. [ ] Domain tests for pure logic (`src/**/*.test.ts`)
7. [ ] (Optional) Hook/component test for primary user flow

### Registry loading (when ≥3 live games)

- [ ] Replace static imports in `module-registry.ts` with `dynamic()` / lazy map per `gameId`
- [ ] Confirm play page bundle does not pull unrelated games

**DoD:** No new slug branches in `parse-game-search-params.ts` without a migration plan to registry-owned parsers.

---

## Slice Q4 — URL state and hydration (stability)

**Goal:** SSR and client agree on query params (`nuqs`).

Per game with query settings:

- [ ] `createSearchParamsCache` on server (`nuqs/server`)
- [ ] Same parsers used on client hooks
- [ ] Game play/launch pages call `parseGameSearchParams(slug, searchParams)` before render
- [ ] Defaults live in domain settings, not duplicated in components

**Refactor target:**

- [ ] `parseGameSearchParams` delegates to `getGameModule(slug)?.parseSearchParams` (or per-game registry map) instead of `if (slug === "word-guess")`

**DoD:** Hard refresh on play URL with query params shows correct mode/length without hydration warnings.

---

## Slice Q5 — Domain tests (integrity of rules)

**Goal:** Game rules are pure, tested, and independent of React.

### Word Guess (reference)

- [x] `evaluate-guess.test.ts` — letter states, duplicate letters
- [x] `game.test.ts` — submit, win/lose, invalid word/length
- [ ] Hook test kept in sync when persistence shape changes (`use-word-guess-game.test.tsx`)

### Next games (Solitaire, etc.)

- [ ] Pure functions in `src/domain/games/<id>/` have `*.test.ts`
- [ ] Cover: valid move, invalid move, win/lose/stalemate (as applicable)
- [ ] No game rule logic only in `"use client"` files

**DoD:** Changing evaluation/move logic fails tests before UI manual check.

---

## Slice Q6 — Client persistence (stability + integrity)

**Goal:** `localStorage` never silently corrupts gameplay.

### Storage adapter (`src/infrastructure/storage/`)

- [x] SSR-safe (`getStorage()` null on server)
- [x] Parse errors return `null`
- [ ] Document keys convention: `<game-id>:<scope>:<mode>:...` (see Word Guess `word-guess:solo:...`)

### Per game that persists state

- [ ] Typed stored shape (interface in domain or feature)
- [ ] `asStored*` guard or Zod parse on read (Word Guess `asStoredWordGuessGame` is the pattern)
- [ ] Invalid stored data → discard and start fresh round (no throw)
- [ ] Do not persist secrets needed for competitive integrity (see Q7)

**DoD:** Manually corrupting localStorage key resets game without white screen.

---

## Slice Q7 — Competitive integrity (when applicable)

**Applies when:** daily leaderboard, multiplayer sync, or anti-cheat matters.

**Current solo client-only (OK for now):**

- Answer in client round state + `localStorage` — acceptable for practice
- Daily word derivable from `getDailySeed` + dictionary — acceptable for casual daily

**Before ranked / multiplayer / shared daily:**

- [ ] Server (or edge) picks and stores answer; client never receives answer until round end
- [ ] Guesses validated server-side; client UI is projection only
- [ ] Daily seed authority on server; same UTC date → same word globally
- [ ] Room codes backed by real session store, not UI-only lobby
- [ ] Rate limits on guess/submit endpoints

**DoD:** Cheating via DevTools/localStorage does not affect shared outcomes.

---

## Slice Q8 — Safety and hardening (production)

**Goal:** Baseline security for a public Next.js app.

### Now (low surface)

- [x] `.env*` gitignored
- [x] No `dangerouslySetInnerHTML` in app code
- [x] Game `error.tsx` hides stack in production
- [ ] Review third-party scripts in `layout.tsx` (keep minimal, no user input in script bodies)

### Before auth, APIs, or user-generated content

- [ ] Zod (or guards) for API bodies and persisted client payloads
- [ ] CSP / security headers via `next.config.ts` or middleware
- [ ] Dependency audit in CI (`npm audit` or Dependabot)
- [ ] Sanitize any future rich text / chat
- [ ] Secrets only in env; never in client bundles

**DoD:** Threat model documented per feature (solo hub vs rooms vs accounts).

---

## Slice Q9 — Release and docs hygiene

- [ ] README scripts table includes `npm run test`
- [ ] `IMPLEMENTATION.md` slice checkboxes match repo reality
- [ ] New game: `docs/GAMES.md` + optional `docs/<GAME>.md` (Solitaire pattern)
- [ ] `npm run build` clean after dependency or Next major bump
- [ ] Manual smoke: hub → game launch → play → back → 404 bad slug

---

## Priority order (recommended)

| Order | Slice | Effort | Impact |
|-------|-------|--------|--------|
| 1 | Q1 CI | Small | Stability — blocks regressions |
| 2 | Q2 Registry integrity | Small | Trust — fixes crossword/solitaire mismatch |
| 3 | Q5 Domain tests | Ongoing | Integrity — per new game |
| 4 | Q4 URL parsers refactor | Medium | Maintainability — removes slug switches |
| 5 | Q6 Persistence guards | Medium | Stability — all persisted games |
| 6 | Q3 Dynamic modules | Medium | Performance — when catalog grows |
| 7 | Q7 Server authority | Large | Integrity — only when competitive |
| 8 | Q8 Security headers | Small–medium | Safety — before public launch |

---

## Mapping to implementation slices

| Build slice ([IMPLEMENTATION.md](./IMPLEMENTATION.md)) | Quality slices to satisfy |
|------------------------------------------------------|---------------------------|
| Slice 0 — Foundation | Q6 (storage), Q8 (env/gitignore) |
| Slice 1 — Hub | Q2 (catalog matches registry), Q9 |
| Slice 2 — Game shell | Q2, Q3, Q4 |
| Adding a game | Q2, Q3, Q5, Q6; Q7 if multiplayer/ranked |
| Pre-release / launch | Q1, Q8, Q9 + full Q2 audit |

---

## References

- [GAMES.md](./GAMES.md) — legal and catalog checklist
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — route/layer build order
- [SOLITAIRE.md](./SOLITAIRE.md) — game-specific design
- Workspace rule: no `<style jsx>` — use Tailwind / `globals.css`
