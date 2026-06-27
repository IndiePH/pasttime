# Deploy & data-build scripts

Operational reference for the **pasttime** web app. These flows are not part of CI and run manually.
Load this file when the task involves deploying, previewing, or regenerating game data assets.

## Cloudflare deploy (web)

Web is deployed as a Cloudflare Worker via OpenNext, **not** `next start`.

| Command | What it does |
|---------|--------------|
| `npm run preview` | Build + local `workerd` preview |
| `npm run preview:serve` | Preview skipping the Next rebuild |
| `npm run deploy` / `upload` | Build + deploy/upload to Cloudflare |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` from `wrangler.jsonc` |
| `npm run preview:stop` | Kills `workerd.exe` (Windows-specific; safe `|| exit 0`) |

Gotchas:
- `next.config.ts` calls `initOpenNextCloudflareForDev()` at the bottom — leave it.
- `wrangler.jsonc` self-references the worker as service `pasttime` (name must match).

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
