# Deploy & data-build scripts

Operational reference for the **pasttime** web app. These flows are not part of CI and run manually.
Load this file when the task involves deploying, previewing, or regenerating game data assets.

## Cloudflare deploy (web)

Web is deployed as a Cloudflare Worker via OpenNext, **not** `next start`.

| Environment | URL |
|-------------|-----|
| Production (custom domain) | https://gamehub.pasttime.xyz |
| Workers.dev | https://gamehub.xent-xent.workers.dev/ |

Worker name in Cloudflare: **`gamehub`** (product brand remains Pasttime).

| Command | What it does |
|---------|--------------|
| `npm run preview` | Build + local `workerd` preview |
| `npm run preview:serve` | Preview skipping the Next rebuild |
| `npm run deploy` / `upload` | Build + deploy/upload to Cloudflare |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` from `wrangler.jsonc` |
| `npm run preview:stop` | Kills `workerd.exe` (Windows-specific; safe `|| exit 0`) |

Gotchas:
- `next.config.ts` calls `initOpenNextCloudflareForDev()` at the bottom — leave it.
- `wrangler.jsonc` self-references the worker as service `gamehub` (name must match).
- **Worker script size (3 MiB free):** large lexicon JSON is served from R2 +
  D1 at runtime — see [`CONTENT-STORAGE-HANDOFF.md`](./CONTENT-STORAGE-HANDOFF.md).

## Lexicon publish (R2 + D1)

Runtime keys use the product-scoped prefix `shared/lexicon/v1/` in bucket
`pasttime-content`. D1 database: `pasttime-lexicon` (binding `LEXICON_DB`).

**First-time production ship** (infra + migrate + publish + deploy; fails fast on
any error; requires `wrangler login`):

```bash
npm run lexicon:ship
```

`lexicon:ship` now includes a **first-run safety check** and exits early if
`pasttime-content` or `pasttime-lexicon` already exists. This avoids accidentally
re-running the first-time setup path.

**After lexicon JSON changes** (skip bucket/DB create; still migrate + publish + deploy):

```bash
npm run lexicon:ship:content
```

| Command | What it does |
|---------|--------------|
| `npm run lexicon:ship` | Create R2/D1 if missing → migrate → publish → deploy |
| `npm run lexicon:ship:content` | Same, but skips infra create (repeatable content refresh) |
| `npm run lexicon:publish` | Publish only (R2 shards + D1 seed) |
| `npm run lexicon:migrate` | Apply D1 migrations to remote |
| `npm run lexicon:migrate:local` | Apply D1 migrations locally (preview) |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` after binding changes |

`lexicon:ship` flags (via `node apps/web/scripts/lexicon/ship-lexicon.mjs`):

- `--skip-setup` — skip R2/D1 create (used by `lexicon:ship:content`)
- `--no-migrate` — publish (+ deploy) without running migrations
- `--no-deploy` — infra + migrate + publish only
- `--allow-existing-setup` — bypass first-run safety check in setup mode

Local `next dev` falls back to reading `packages/domain` JSON when R2/D1
bindings are unavailable.

## Data-build scripts (not part of CI)

These regenerate large JSON assets committed to `packages/domain`. They need external
secrets/egress and are run manually:

### Word guess dictionary
- `word-guess:build-dictionary` (script: `apps/web/scripts/word-guess/`)
- Output: `packages/domain/games/shared/dictionary.target.json`

### Crossword assets
Scripts live in `apps/web/scripts/crossword/`.

- `crossword:build-clues` — **requires `APIFY_TOKEN`** or it exits non-zero.
  - Output: `packages/domain/games/crossword/clues.generated.json`
  - Reads/writes a `clues.cache.json` next to the output.
  - Reads a profanity blocklist.
- `crossword:collect-definitions` — collects word definitions.
- `crossword:build-enriched`
  - Output: `packages/domain/games/shared/dictionary.full.enriched.json`
  - The canonical words+definitions+synonyms+antonyms store, committed and exposed via
    `@pasttime/domain/games/shared`.

### Crossword corpus
- `npm run build:corpus -w @pasttime/domain` — builds the crossword corpus in the domain package.

## CI gates (context)

`.github/workflows/ci.yml` runs on every push/PR and must stay green:
`npm ci` → `lint` → `typecheck` → `test` → `build`. Node is pinned via `.nvmrc` (≥24).
