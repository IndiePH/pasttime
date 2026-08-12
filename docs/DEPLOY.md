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
| Secrets | `RESEND_API_KEY`, `FEEDBACK_TO_EMAIL`, `FEEDBACK_FROM_EMAIL` | Dashboard **Secret**, or from `apps/web`: `npx wrangler versions secret put <NAME>` then `npx wrangler versions deploy` (use `secret put` only when the latest version is already the live deployment). Declared in `secrets.required`. |
| Public plaintext | `NEXT_PUBLIC_ADSENSE_*` | `vars` in `apps/web/wrangler.jsonc` (source of truth; safe to commit — they appear in page HTML / ads.txt) |

Local: copy from `.env.example` into `.env.local` (gitignored). Never commit real Resend keys.

If the latest Worker version is not currently deployed, `wrangler secret put` fails — prefer `versions secret put` + `versions deploy`.

### AdSense (production)

Production values live under `"vars"` in `apps/web/wrangler.jsonc`. They must be present for the Next **build**, so redeploy after changing them. Local overrides: `.env.local`.

| Variable | AdSense unit name (label only) | Notes |
|----------|--------------------------------|--------|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | — | Use `ca-pub-…` even if Account info shows `pub-…` |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOP` | `pasttime-global-top-strip` | Numeric ad unit ID, not the name |
| `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM` | `pasttime-global-bottom-strip` | Numeric ad unit ID |
| `NEXT_PUBLIC_ADSENSE_SLOT_HUB` | `pasttime-hub-grid-card` | Numeric ad unit ID |

After deploy, check `https://pasttime.xyz/ads.txt` and `https://gamehub.pasttime.xyz/ads.txt` — each should list `google.com, pub-…, DIRECT, f08c47fec0942fa0` (not `# AdSense not configured`). Units may stay empty until the site is approved in AdSense.

**Site review:** Google Publisher Policies require a real Privacy Policy that discloses AdSense/cookie use (and preferably links [How Google uses data](https://policies.google.com/technologies/partner-sites)). Keep `/privacy`, `/about`, and `/terms` substantive — not placeholders — then request review on the **apex** site (`pasttime.xyz`). See `brain/wiki/adsense-manual-units.md`.

**Pre-review crawl checks (apex):**

| URL | Expect |
|-----|--------|
| `https://pasttime.xyz/robots.txt` | 200, `Allow: /`, `Sitemap: https://pasttime.xyz/sitemap.xml` |
| `https://pasttime.xyz/sitemap.xml` | 200 urlset (hub, legal, available game landings, `/word-guess/policy`) |
| `https://pasttime.xyz/` | SSR hub copy including editorial section; no `animate-pulse` skeletons |
| `https://pasttime.xyz/games/<slug>` | SSR overview article for each available game |

Search Console property must be **`pasttime.xyz`** (`pasttime.app` / `www.pasttime.xyz` do not resolve). After deploy, re-submit the sitemap URL and use URL Inspection on robots/sitemap if GSC still shows fetch errors.

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
