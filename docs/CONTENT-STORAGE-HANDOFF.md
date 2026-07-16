# Handoff: Lexicon content on R2 + D1 (Worker size fix)

**Status:** Ready to implement — decisions locked 2026-07-16  
**Trigger:** Cloudflare deploy fails with Worker script > 3 MiB (free plan).  
**Branch context:** `game/crossword` / PR toward `main`; web Worker name `gamehub`.

New session: read this file end-to-end before coding. Do **not** re-litigate storage choice unless requirements change.

---

## 1. Problem

OpenNext deploys the web app as a Cloudflare Worker. Free plan **Worker script limit = 3 MiB**.

Large JSON is **statically imported** into `@pasttime/domain` and therefore bundled into the Worker:

| File | ~Size | Imported by |
|------|-------|-------------|
| `packages/domain/games/shared/dictionary.full.json` | ~3.1 MiB | `word-guess/dictionary.ts` (guess validation) |
| `packages/domain/games/shared/dictionary.full.enriched.json` | ~3.3 MiB | `enriched-dictionary.ts` → WG answers + defs |
| `packages/domain/games/crossword/corpus.json` | ~1.5–1.8 MiB | `crossword/generator.ts` |

Static assets / R2 objects / D1 rows do **not** count toward the 3 MiB script limit.  
`@opennextjs/cloudflare` is already ~1.20 — upgrading for “v1.2 babel removal” will not fix this.

Related ops notes: [`docs/DEPLOY.md`](./DEPLOY.md). Dictionary pipeline background: [`brain/wiki/dictionary-pipeline.md`](../brain/wiki/dictionary-pipeline.md).

---

## 2. Locked architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Worker (OpenNext) — UI + game rules only (small)            │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐      ┌─────────────────────┐
│ R2 — word list JSON │      │ D1 — definitions    │
│ shards (bulk load)  │      │ / crossword clues   │
└─────────────────────┘      └─────────────────────┘
         │                              │
         ▼                              ▼
   fetch once at launch          batch lookup after
   → keep Set/Map in memory      puzzle / on reveal
```

| Store | Holds | Access pattern |
|-------|--------|----------------|
| **R2** | Word-list JSON, preferably by length; optional combined crossword answers pack (answers only, no clues) | Fetch on launch / length confirm → in-memory for play |
| **D1** | Definitions / crossword clue text keyed by word | Batch after crossword generate; on-demand for WG post-solve defs |
| **Worker / domain code** | Rules, generators (given an in-memory pool), UI | No giant `import … from "*.json"` for runtime lexicon |

**Not in scope for this migration:** moving multiplayer onto Workers. Keep `apps/server` (Node + WebSocket). Content loading is orthogonal; server should use the same R2/D1 sources for authoritative validation later.

**Card / image art:** stay on static assets and/or R2 later — does not affect script size if not inlined. See [`docs/CARD-ASSETS.md`](./CARD-ASSETS.md).

---

## 3. Product constraints (planned; align implementation)

- **Word Guess:** lengths **5–10 only** (drop 3–4 if still present in settings).
- **Crossword:** **15×15 only** (remove other grid sizes from settings/UI when touching that area).
- Future lexicon games (Type Rush, Type Shield, Tile Words, Word Factory) should **reuse** this content layer — do not add new bundled JSON.

Games with negligible content (solitaire modes, Fleetship, card games, Reversi, etc.) are unaffected.

---

## 4. Shared dictionary model

Word Guess and Crossword share one **answer universe** (today: enriched / corpus answers).

| Game | R2 load | D1 |
|------|---------|-----|
| Word Guess | **One length shard** at length picker → play | Definition for answer on reveal (optional) |
| Crossword | **All needed lengths** (parallel shards) **or** one `crossword/answers.json` (answers only) before generate | Clues for **placed** words only — **one batch** after grid exists |

Do **not** use the full guessable lexicon as the crossword pool (quality + size). Crossword pool = answer words that have (or will have) D1 defs.

Generator today requires `clue.length > 0` to enter the pool (`generator.ts`). Change to answer-only pool + hydrate `text` after D1 fetch.

---

## 5. Latency expectations (accepted)

- Extra wait = **one-time** R2 fetch(es) at launch, typically **≪ 1 s** (often ~50–500 ms); slow networks may exceed 1 s — show brief loading state.
- After load, play latency ≈ current in-memory behavior.
- Avoid D1/R2 inside generation loops or per-keystroke validation.

---

## 6. Suggested R2 object layout

Version keys so clients never mix packs:

```text
lexicon/v1/answers/{length}.json          # ["WORD", ...] or { "words": [...] }
lexicon/v1/guessable/{length}.json        # WG validation set (superset of answers)
lexicon/v1/crossword/answers.json         # optional: all answer words, no clues
```

Build these from existing committed sources (`dictionary.target.json`, `dictionary.full.json`, enriched) via a **publish script** — keep source JSON in repo for builds/tests if useful, but **runtime must not static-import the large files into the Worker graph**.

---

## 7. Suggested D1 schema (minimal)

```sql
CREATE TABLE word_definitions (
  word TEXT PRIMARY KEY,          -- uppercase
  definition TEXT NOT NULL,
  synonyms TEXT,                  -- JSON array or NULL
  antonyms TEXT,                  -- JSON array or NULL
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_word_definitions_word ON word_definitions(word);
```

Seed from `dictionary.full.enriched.json` (and/or corpus clues). API: `GET`/`POST` batch by words for crossword; single-word for WG reveal.

---

## 8. Code touchpoints (current imports to remove from runtime bundle)

**Must stop bundling into Worker:**

- `packages/domain/games/word-guess/dictionary.ts` — `dictionary.target.json`, `dictionary.full.json`
- `packages/domain/games/shared/enriched-dictionary.ts` — `dictionary.full.enriched.json`
- `packages/domain/games/crossword/generator.ts` — `corpus.json`

**Call sites to wire async load / inject pool:**

- WG: `pick-target-word.ts`, `game.ts` / `isWordGuessValidWord`, `word-guess-play-view.tsx` (`getEnrichedWord`)
- Crossword: `settings.ts` → `createCrosswordPuzzle` / `createCrosswordGameState`, `use-crossword-game.ts`, play view clue hydration

**Domain package rule:** prefer pure functions that accept `ReadonlySet<string>` / `PoolWord[]` / definition maps as arguments so Node tests can use fixtures without R2.

---

## 9. Implementation phases

### Phase 0 — Infra
- [ ] Create R2 bucket + bind in `apps/web/wrangler.jsonc`
- [ ] Create D1 database + bind; migrations under repo
- [ ] Public read path for R2 (custom domain or Worker route) usable from browser
- [ ] Env/docs: bucket name, D1 name, key prefix `lexicon/v1/`
- [ ] Update `docs/DEPLOY.md` with publish + migrate commands

### Phase 1 — Publish pipeline
- [ ] Script: split answer + guessable lists by length → upload R2
- [ ] Script: seed D1 from enriched definitions
- [ ] CI or manual checklist: publish before deploy when lexicon changes
- [ ] Keep large JSON out of the **client/server Worker graph** (tests may still read files from disk)

### Phase 2 — Domain API refactor
- [ ] `isWordGuessValidWord(word, length, guessableSet)`
- [ ] `pickWordGuessAnswer(length, mode, date, answerList)`
- [ ] Crossword generator takes injected answer pool; clues optional until hydrate
- [ ] `hydrateCrosswordClues(puzzle, defsByWord)`
- [ ] Unit tests with small fixtures (no multi‑MiB imports in test bundle if possible)

### Phase 3 — Web load UX
- [ ] WG: on length confirmed → fetch guessable (+ answers) shard → then navigate/start play
- [ ] Crossword: on launch confirm → fetch answers pack → generate → batch D1 clues → show play
- [ ] Loading / error / retry UI
- [ ] Session memory cache (don’t re-fetch same length repeatedly)

### Phase 4 — Verify deploy size
- [ ] `opennextjs-cloudflare build`
- [ ] `npx wrangler deploy --dry-run` (from `apps/web`) — confirm script ≪ 3 MiB
- [ ] Smoke: WG daily/practice; crossword daily; post-solve definition if applicable
- [ ] `npm run typecheck` / targeted tests

### Phase 5 — Product trims (can pair with above)
- [ ] WG: remove lengths 3–4 from settings/UI
- [ ] Crossword: 15×15 only in settings/UI/generator defaults

### Out of scope (later)
- Multiplayer authoritative validation via same R2/D1 on `apps/server`
- Durable Objects migration for realtime
- Moving card decks to R2
- Deleting pipeline intermediates (e.g. `crossword-definitions.json`) — still used by build scripts; not required for this fix

---

## 10. Success criteria

1. Cloudflare deploy of `gamehub` succeeds on **free** Worker size limit (or dry-run shows comfortable headroom).
2. No runtime `import` of the three large JSON files into the web Worker graph.
3. WG and crossword playable with load-at-launch; in-play feel unchanged after load.
4. Crossword clues correct after D1 hydrate; daily seeds still deterministic for answers.
5. Typecheck/tests green for touched packages.

---

## 11. Non-goals / rejected shortcuts

- Relying on Workers Paid (10 MiB) as the strategy  
- Converting JSON → SQL **files** still imported into the Worker  
- Per-guess D1/R2 round-trips for validation  
- D1 queries inside crossword placement loops  

---

## 12. Quick start for the implementing agent

1. Read this doc + `docs/DEPLOY.md` + `brain/wiki/dictionary-pipeline.md`.
2. Confirm wrangler bindings plan with user if account/bucket names are unset.
3. Implement Phase 0 → 1 → 2 → 3 → 4 in order; don’t ship UI loaders before domain accepts injected pools.
4. Measure with `wrangler deploy --dry-run` before calling done.
5. Update `docs/DEPLOY.md` and `brain/wiki/engineering-decisions.md` when shipped.

**Owner decision-maker:** user (2026-07-16 session).  
**Prior chat topic:** Cloudflare 3 MiB limit → R2 shards + D1 defs; multiplayer stays on Node for now.
