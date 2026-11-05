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

### Secrets vs plaintext vars

`wrangler deploy` **deletes dashboard plaintext Variables** unless they are listed in `wrangler.jsonc` `vars` (or `keep_vars` is true). **Secrets are never deleted** by deploy.

| Kind | Examples | Where |
|------|----------|--------|
| Secrets | `RESEND_API_KEY`, `FEEDBACK_TO_EMAIL`, `FEEDBACK_FROM_EMAIL`, `TRAFFIC_VIEW_KEY` | Dashboard **Secret**, or from `apps/web`: `npx wrangler versions secret put <NAME>` then `npx wrangler versions deploy` (use `secret put` only when the latest version is already the live deployment). Resend names are declared in `secrets.required`. `TRAFFIC_VIEW_KEY` only unlocks `/traffic`; leaving it unset does not block deploy and does not stop counting. |

Local: copy from `.env.example` into `.env.local` (gitignored). Never commit real Resend keys or `TRAFFIC_VIEW_KEY`.

### Foot traffic

Page views are daily aggregates in D1 table `site_traffic_daily` (migration `apps/web/migrations/0002_site_traffic.sql` on `pasttime-lexicon`). Apply from `apps/web` with `npm run lexicon:migrate` before the first production count, or `npm run lexicon:migrate:local` for the local D1 used by `next dev`. The private summary is [https://pasttime.xyz/traffic](https://pasttime.xyz/traffic). Country is Cloudflare’s edge code (`cf.country`, then `CF-IPCountry`). IP addresses are not stored. A browser is one visitor per UTC day.

The hub Top picks row uses that table. It shows the three playable games with the most views, adding every `/games/{id}` path for a game. When the table is missing, or no playable game has a view, the row stays the manual `featured` games.

Deployed 2026-11-04 as Worker version `02df0176-7374-4719-9571-99b9b5f7b5c2`. `TRAFFIC_VIEW_KEY` is a Worker secret. See `brain/wiki/site-traffic.md`.

If the latest Worker version is not currently deployed, `wrangler secret put` fails — prefer `versions secret put` + `versions deploy`.

### Unity LevelPlay (Word Guess Android)

The website serves Adsterra display banners in the header and left rail
(`BannerPlaceholder`, `PageSideBanner`). The tags are client-side and do not
require `/ads.txt`; that path intentionally remains a 404. They do not change
`/app-ads.txt`. Advertising for the Word Guess Android app is Unity LevelPlay.
See `brain/wiki/web-banner-placeholders.md` for placement behavior and blank-ad
diagnostics.

`https://pasttime.xyz/app-ads.txt` must stay on the apex. It starts with `ownerdomain=pasttime.xyz` and includes ironSource DIRECT, Unity Ads DIRECT (`unity.com` / `unity3d.com`), plus the Unity reseller list baked in `apps/web/src/lib/app-ads-unity-list.ts`. The public publisher ID lives in `apps/web/src/lib/app-ads.ts`. Do not put ironSource API keys in the repo or in Worker vars.

`https://pasttime.xyz/app-ads.txt` returns the LevelPlay file, while
`https://pasttime.xyz/ads.txt` remains a 404 by design. Privacy, about, and
terms describe Adsterra on the website and LevelPlay on the Android app. The
app disclosure is `/word-guess/policy`. See
`brain/wiki/levelplay-app-ads.md`.

Each banner makes one bounded retry when the provider request fails, times out,
or produces no iframe. Loaded ads are not periodically refreshed.

**Pre-review crawl checks (apex):**

| URL | Expect |
|-----|--------|
| `https://pasttime.xyz/robots.txt` | 200, `Allow: /`, `Disallow: /traffic` and `/api/traffic` for `*`. Named answer-engine crawlers also skip `/games/*/play`, `/stats`, and `/room`. `Sitemap: https://pasttime.xyz/sitemap.xml` |
| `https://pasttime.xyz/llms.txt` | 200 text map of playable landings, about, legal, and coming-soon pages. No play, stats, room, or `/traffic` URLs |
| `https://pasttime.xyz/sitemap.xml` | 200 urlset (hub at the apex, legal, available + coming-soon landings, `/word-guess/policy`). `/games` is the same hub and is not listed. `lastmod` is `SITE_CONTENT_UPDATED`, not the request time |
| `https://pasttime.xyz/` | SSR hub copy including editorial; playable catalog plus labeled Coming soon; no `animate-pulse` skeletons |
| `https://pasttime.xyz/games/<slug>` | SSR origin/history article for every registry game (coming soon: no Play) |
| `https://pasttime.xyz/games/<slug>/play` | `noindex` (thin interactive shell) |

Search Console property must be **`pasttime.xyz`** (`pasttime.app` / `www.pasttime.xyz` do not resolve). After deploy, re-submit the sitemap URL and use URL Inspection on hub + game landings (Request indexing), plus robots/sitemap if GSC still shows fetch errors.

**Stay on Cloudflare Free:** keep large lexicon data in R2/D1 (not in the Worker script), leave apex attached as a Worker Custom Domain, and avoid paid Workers/Image/AI add-ons until Word Guess LevelPlay revenue covers them. SEO leverage that costs $0: SSR copy, sitemap/GSC, canonicals/JSON-LD, `/llms.txt`, noindex on play/stats/room.

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
bindings are unavailable, **or** when local D1 is bound but empty/unmigrated
(common after `initOpenNextCloudflareForDev()` wires bindings without a seed).

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
