# AdSense manual units
updated: 2026-08-12
tags: [monetization, adsense, devops, cloudflare]
related: [engineering-decisions]

Pasttime uses **manual Google AdSense display units** only (no Auto ads). Desktop-first; mobile unit IDs later.

## Domains (keep both)

| Host | Role |
|------|------|
| `pasttime.xyz` | **AdSense Sites** listing (apex required). Worker custom domain on `gamehub`. Must stay live for review/ads.txt. |
| `gamehub.pasttime.xyz` | Same Worker/app; product subdomain alias. |

**Critical distinction:** Cloudflare **DNS zone** ≠ Worker **Custom Domain**. Apex must be added on Worker `gamehub` → Settings → Domains & Routes → Custom Domain, or `https://pasttime.xyz` won’t serve the app/`ads.txt`. AdSense rejects subdomain-only site URLs (“must be a valid top-level domain”).

Do not detach `pasttime.xyz` from the Worker while site review is pending (often **2–4 weeks**).

## Placements

| Logical slot | AdSense unit name | Env var | Reserved size |
|--------------|-------------------|---------|---------------|
| `global-top-strip` | `pasttime-global-top-strip` | `NEXT_PUBLIC_ADSENSE_SLOT_TOP` | 728×90 |
| `global-bottom-strip` | `pasttime-global-bottom-strip` | `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM` | 728×90 |
| `hub-grid-card` | `pasttime-hub-grid-card` | `NEXT_PUBLIC_ADSENSE_SLOT_HUB` | card / ~300×250 |

Plus publisher: `NEXT_PUBLIC_ADSENSE_CLIENT`.

- AdSense UI often shows **`pub-…` only** — env / `data-ad-client` use **`ca-pub-…`** (same digits; add `ca-`). Code also accepts bare `pub-…` via `normalizeAdsenseClient`.
- Unit **names** are AdSense labels only. Env needs the **numeric ad unit ID** (`data-ad-slot`), not the name string.
- `NEXT_PUBLIC_*` is inlined at **Next build** time — change values → **redeploy**.
- Next only replaces **literal** `process.env.NEXT_PUBLIC_*` in the client bundle. Dynamic `process.env[key]` works on the Worker/SSR but is `undefined` in the browser → AdPanel SSR/hydration mismatch (live `<ins>` vs placeholder). Slot readers in `adsense.ts` must stay static.
- Unset client/slots → dashed placeholders. Removed: `static-below-header`. No side rails.

Strip units request a **fixed 728×90** leaderboard (`<ins>` width/height, no `data-ad-format="auto"` / `data-full-width-responsive`). Responsive + full-width lets AdSense serve ~726×280 and ignore the reserved box. Hub cards use a fixed **300×250**.

## Where config lives (do not put secrets here)

| Kind | Names | Store | Survives `wrangler deploy`? |
|------|-------|--------|------------------------------|
| Public AdSense | `NEXT_PUBLIC_ADSENSE_CLIENT`, `_SLOT_*` | `vars` in `apps/web/wrangler.jsonc` (source of truth). Local: `.env.local` (gitignored). | Yes, if in `wrangler.jsonc` |
| Feedback / Resend | `RESEND_API_KEY`, `FEEDBACK_TO_EMAIL`, `FEEDBACK_FROM_EMAIL` | Worker **Secrets** only; `secrets.required` in wrangler. Local: `.env.local`. | Yes (secrets never wiped) |

**Never** commit Resend API keys or put them in `vars` / docs / wiki. Dashboard plaintext Variables alone are wiped on every deploy unless listed in `vars` or `keep_vars` is set.

Numeric publisher/slot IDs are public (they appear in page HTML and `ads.txt`) — production values live in `wrangler.jsonc` `vars`. Do not paste secret values into brain pages.

## Verification stack

| Method | Status |
|--------|--------|
| `/ads.txt` | Route serves `google.com, pub-…, DIRECT, f08c47fec0942fa0` when client set. Must work on **apex**. |
| `/app-ads.txt` | Same publisher line for **AdMob** mobile apps (e.g. Word Guess). Crawler ignores Play Website path — file must be at apex `https://pasttime.xyz/app-ads.txt`. Word Guess mobile privacy (Play): `https://yoxent.github.io/word-guess/privacy`. |
| AdSense `<script>` | `AdSenseScript` in root layout (env-gated). |
| Meta `google-adsense-account` | Not implemented; optional if ads.txt already verifies. |

Code: `apps/web/src/lib/adsense.ts`, `AdPanel`, `AdSenseScript`, `app/ads.txt/route.ts`. Spec/plan: `docs/superpowers/*adsense*`. Deploy notes: `docs/DEPLOY.md`.

## Consent (EEA / UK / CH)

Google requires a **certified CMP** for personalized ads in EEA/UK/CH. Choice for Pasttime: **Google’s CMP**, **3 choices** (Consent / Do not consent / Manage options) — not a third-party CMP yet. See [AdSense CMP requirements](https://support.google.com/adsense/answer/13554116).

## Site review / Publisher Policies

Google Publisher Policies ([support article](https://support.google.com/adsense/answer/10502938)) require a real privacy policy that discloses AdSense-related data use (cookies / web beacons / IP, third parties placing cookies) and preferably links [How Google uses data](https://policies.google.com/technologies/partner-sites).

Also required for approval readiness: [unique content + UX](https://support.google.com/adsense/answer/10015918) and avoid [thin content / doorway patterns](https://support.google.com/webmasters/answer/9044175#thin-content).

Pasttime legal pages (`/privacy`, `/about`, `/terms`) must stay **substantive** — not placeholders.

### Rejection history

| Date | Result | Cause identified | Fix |
|------|--------|------------------|-----|
| 2026-07-29 | **Fail** — Low value content | Root `loading.tsx` emits skeleton `animate-pulse` HTML in initial response for ALL routes. Googlebot sees loading placeholders instead of text content. Game pages have ~1 sentence of descriptive text. Coming-soon cards dilute the catalog. No sitemap. | Removed `loading.tsx` (root, `games/[slug]`, `games/[slug]/play`). Added SSR `GameOverviewSection` (~150+ words) on available game landings. Hub shows available games only. Added `sitemap.ts` + `robots.ts`. |
| 2026-08-12 | **Fail** — Low value content (re-review) | Production already had overviews + sitemap; hub homepage was still thin (~800 visible chars of mostly nav/cards). Interactive `/play`, `/stats`, `/room` shells were indexable. | Added SSR `HubEditorial` + hero tip copy; `noIndex` on play/stats/room; keep Word Guess `/word-guess/policy` in sitemap; shared `pageMetadata` / JSON-LD. Redeploy, then re-request review. |

### Pre-submit audit (2026-08-12, apex)

| Check | Result |
|-------|--------|
| Hub `/` SSR | ~2.8k visible chars; editorial headings present; no `animate-pulse`; no CF 1102 |
| Game landings | Crossword / Solitaire / Word Guess / Sudoku return overview copy (~1.1–1.3k visible chars) |
| `/play`, `/stats` | `noindex, nofollow` |
| `/privacy` | AdSense + cookies disclosure + Google partner-sites link |
| `/ads.txt`, `/app-ads.txt`, gamehub `/ads.txt` | `google.com, pub-4297882562709937, DIRECT, f08c47fec0942fa0` |
| `/robots.txt`, `/sitemap.xml` | 200; sitemap includes hub, legal, available games, `/word-guess/policy` |
| Canonical / JSON-LD | Hub has `canonical` + `WebSite`/`Organization` JSON-LD |
| Favicon | `/favicon.ico` 200 (Next default). No dedicated `og:image` yet (optional share polish). |

Strip/card `<ins>` units use **fixed** 728×90 / 300×250 (no `data-ad-format="auto"`) so reserved shells match served creatives.

### Search Console (robots / sitemap)

Live apex (verified 2026-08-12):
- `https://pasttime.xyz/robots.txt` → **200**, `Allow: /`, `Sitemap: https://pasttime.xyz/sitemap.xml` (Cloudflare may prepend managed AI-bot Disallows; Googlebot is still allowed).
- `https://pasttime.xyz/sitemap.xml` → **200**, valid urlset for hub, legal, game landings, Word Guess policy.
- `pasttime.app` and `www.pasttime.xyz` **do not resolve** — GSC property must be **`pasttime.xyz`** (or `https://pasttime.xyz`), not those hosts.

If GSC still says “no robots.txt” / “could not fetch sitemap” after ~24h on the correct property: use URL Inspection on `/robots.txt` and `/sitemap.xml`, then **Sitemaps → Add** `https://pasttime.xyz/sitemap.xml` again. Stale GSC fetch errors are common before first successful crawl; the files are already live.

### Free Cloudflare plan (keep costs at $0)

Stay on Workers Free while revenue is $0:
- Keep lexicon off the Worker bundle (R2 + D1) so script stays under the **3 MiB free** limit — see `docs/DEPLOY.md` / `CONTENT-STORAGE-HANDOFF.md`.
- Do **not** turn on paid Workers features, paid Image Resizing, or paid AI products for SEO.
- Cloudflare managed robots may block AI trainers (`GPTBot`, etc.); leave Googlebot allowed.
- Apex `pasttime.xyz` must remain a Worker **Custom Domain** on `gamehub` for review + `ads.txt`.
- Visibility that stays free: GSC sitemap + URL Inspection, SSR editorial landings, canonicals/JSON-LD, noindex thin shells, internal links from hub → game landings → Play.

### Diagnosis method

When `pasttime.xyz` was rejected for "Low value content," the initial HTML was inspected via curl:
- Homepage (`/`): returned `<div class="animate-pulse ...">` skeleton blocks instead of game titles/descriptions. The real content was buried in Next.js RSC Flight data (`self.__next_f.push()`).
- All routes were affected by root `loading.tsx` Suspense boundary.
- Game pages only had one-line descriptions (e.g., "Fill the grid using clues across and down.").
- `/play/crossword` returned 404 (wrong URL; actual routes are `/games/[slug]`).
- No `sitemap.xml`.
- 9 of 13 listed games are "Coming Soon" with no playable content.

### Actions remaining

1. [x] Remove loading.tsx files (SSR skeleton fix)
2. [x] Add substantive SSR text to game landing pages (`GameOverviewSection` + `game-overviews.ts`)
3. [x] Create sitemap.xml (`app/sitemap.ts`) + robots.txt (`app/robots.ts`)
4. [x] Hide "Coming Soon" games from hub (registry kept; hub filters to `available`)
5. [x] Hub editorial SSR (`HubEditorial`) + noindex thin interactive routes
6. [x] Redeploy healthy Worker (no CF 1102); fixed strip/card ad request sizes
7. [x] Pre-submit crawl checks on apex (see audit table above)
8. [ ] GSC: confirm property is `pasttime.xyz`; re-submit sitemap; URL Inspection on `/`, game landings, robots, sitemap; Request indexing
9. [ ] Re-request AdSense site review on `pasttime.xyz` (only after GSC sees the current deploy)
10. [ ] Optional later (not blockers): branded `og:image` / apple-touch icon; `www` → apex redirect if you add `www` DNS

## Operator checklist

1. AdSense units named as above; copy **numeric** IDs into `.env.local` + `wrangler.jsonc` `vars` (not unit name strings).
2. Publisher: set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-…` even if Account info shows `pub-…`.
3. Resend/feedback: `wrangler versions secret put <NAME>` (or dashboard Secret), then deploy that version if needed — never plaintext.
4. Redeploy web (`npm run deploy` from repo / `apps/web`) so Next build bakes `NEXT_PUBLIC_*`.
5. Confirm `https://pasttime.xyz/ads.txt` (and gamehub) shows the `google.com, pub-…, DIRECT, …` line — not `# AdSense not configured`.
6. Confirm `/privacy` discloses AdSense + Google partner-sites link; `/about` and `/terms` are real copy.
7. AdSense Sites = apex; submit/wait Ready (ads may stay empty until then).
8. Keep Google CMP consent message published for future sites.
9. **Before re-submitting**: verify no `animate-pulse` skeleton blocks appear in the initial HTML of any **content** page. Use `curl <url>` and search for `animate-pulse` after deploy. Also confirm the Worker is not returning Cloudflare **1102** (resource limits) — reviewers cannot approve an error page.
10. **Content enrichment**: each `available` game landing page must include SSR overview copy (`GameOverviewSection`). Hub must not feature coming-soon shells as primary inventory.
11. Confirm `https://pasttime.xyz/sitemap.xml` and `https://pasttime.xyz/robots.txt` resolve after deploy.
