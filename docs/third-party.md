# Third-party inventory

Last audited: 2026-10-02

## Needs attention

- `next` 16.2.9 (`apps/web`) — critical. `npm audit` names App Router middleware/proxy bypass, Server Action denial of service, and Server Action SSRF, and fixes them in 16.3.8 (minor). `@opennextjs/cloudflare` 1.20.7 also refuses Next.js 16.2.0–16.3.5 because of `next/og` RCE CVE-2026-94545 and requires 16.3.6 or newer.
- `electron` 42.5.0 (`apps/desktop`) — high. Latest is 44.5.1 (major). Audit names sandbox, protocol-handler, and webview issues through 42.9.3.
- `expo` 56.0.12 (`apps/mobile`) — high, via `@expo/cli` and `node-forge`. Latest is 57.0.26 (major). Audit's suggested fix is `expo@44.0.6`, which is still inside the reported range `>=41.0.0-alpha.0`.
- GitHub Actions — upgrade risk high. `.github/workflows/ci.yml` pins `actions/checkout@v4` and `actions/setup-node@v4`; latest releases are checkout v7.0.1 and setup-node v7.0.0.
- transitive `tar` — critical. Decompression/parse denial of service via unlimited input.
- transitive `@expo/cli` — high. Pulled in by `expo`.
- transitive `@expo/code-signing-certificates` — high, via `node-forge`.
- transitive `@xmldom/xmldom` — high. XML injection that bypasses `requireWellFormed`.
- transitive `brace-expansion` — high. Denial of service via unbounded expansion.
- transitive `browserslist` — high. Unbounded memory growth, and a crash via untrusted stats JSON.
- transitive `fast-uri` — high. Host confusion and SSRF.
- transitive `image-size` — high. Infinite loops in JXL, HEIF, and ICNS parsers.
- transitive `ip-address` — high. SSRF via leading-zero IPv4 octets.
- transitive `js-yaml` — high. Quadratic CPU on YAML merge keys.
- transitive `miniflare` — high, via `sharp` and `undici`. This is also why `wrangler` is moderate.
- transitive `nanoid` — high. Non-secure generators can loop on a bad size.
- transitive `node-forge` — high. RSA PKCS#1 v1.5 signature verification accepts extra nested digest fields.
- transitive `postcss` — high. Arbitrary file read via `sourceMappingURL`. Root `package.json` overrides `postcss` to 8.5.10, inside the vulnerable range `<=8.5.22`. Audit ties the fix to `next@16.3.8`.
- transitive `sharp` — high, via libvips and libheif. Audit fix is `next@16.3.8`.
- transitive `undici` — high. Cross-user information disclosure via cache directives.

53 direct dependencies are behind: 8 patch, 22 minor, 23 major.

## Integrations

### Cloudflare

- Role: Hosts the web app on Workers and stores lexicon content in R2 and D1. Images and log observability are bound in Wrangler config.
- Workspace: apps/web
- Where used: `apps/web/open-next.config.ts` (`defineCloudflareConfig`), `apps/web/src/lib/lexicon/server.ts` (`getCloudflareContext`, `CONTENT_R2`, `LEXICON_DB`), `apps/web/wrangler.jsonc`, deploy scripts in `apps/web/package.json`
- Config names: bindings `CONTENT_R2`, `LEXICON_DB`, `IMAGES`, `ASSETS`, `WORKER_SELF_REFERENCE`; worker `gamehub`
- Package: `@opennextjs/cloudflare`, `wrangler`
- Current: `@opennextjs/cloudflare` 1.20.0; `wrangler` 4.104.0
- Latest: `@opennextjs/cloudflare` 1.20.7; `wrangler` 4.147.0
- Advisories: none for `@opennextjs/cloudflare`; moderate for `wrangler` (via `miniflare`)
- Bump: patch for `@opennextjs/cloudflare`; minor for `wrangler`
- Upgrade risk: medium
- Breakage: `defineCloudflareConfig` and `getCloudflareContext({ async: true })` are unchanged in the 1.20.1–1.20.7 notes. `@opennextjs/cloudflare` 1.20.7 raises the supported Next.js floor to 16.3.6, and `apps/web/package.json` pins `next@16.2.9`, so that patch does not apply on the current Next.js pin. `apps/web/wrangler.jsonc` sets `compatibility_date` to `2026-04-15` with `nodejs_compat`. Workers SDK notes say an explicit `nodejs_compat` flag is rejected only when the compatibility date is `2026-08-04` or later. `wrangler d1 migrations apply` remains; later notes fix CRLF and lowercase `end` splitting rather than removing the command.
- Checked: 2026-10-02
- Status: active

#### Notes

### GitHub

- Role: Runs CI, and is the desktop auto-update publish target.
- Workspace: apps/desktop; CI at the repo root
- Where used: `.github/workflows/ci.yml` (`actions/checkout@v4`, `actions/setup-node@v4`), `apps/desktop/package.json` (`publish.provider` `github`), `apps/desktop/src/main.ts` (`autoUpdater.checkForUpdatesAndNotify`)
- Config names: none
- Package: `actions/checkout`, `actions/setup-node`, `electron-updater`
- Current: checkout v4; setup-node v4; `electron-updater` 6.8.9
- Latest: checkout v7.0.1; setup-node v7.0.0; `electron-updater` 6.8.9
- Advisories: none
- Bump: major
- Upgrade risk: high
- Breakage: checkout v5 runs the action on Node 24 and documents a higher minimum runner. setup-node v5 is marked breaking and also moves to Node 24; v6 limits automatic caching to npm, which matches `cache: npm` in `.github/workflows/ci.yml`. checkout v7 blocks fork-PR checkouts for `pull_request_target` and `workflow_run`; this workflow triggers on `push` and `pull_request`. `electron-updater` is already current.
- Checked: 2026-10-02
- Status: active

#### Notes

### Google Fonts

- Role: Supplies the UI typefaces at build time.
- Workspace: apps/web
- Where used: `apps/web/src/app/layout.tsx` (`next/font/google`: Geist, Geist Mono, Archivo Black, Roboto Slab, Space Grotesk)
- Config names: none
- Package: none
- Current: none
- Latest: none
- Advisories: none
- Bump: current
- Upgrade risk: low
- Breakage: Fonts are loaded by Next.js, not a separate package. The critical Next.js advisory is on the `next` dependency.
- Checked: 2026-10-02
- Status: active

#### Notes

### Resend

- Role: Sends the feedback form email.
- Workspace: apps/web
- Where used: `apps/web/src/app/api/feedback/route.ts`
- Config names: `RESEND_API_KEY`, `FEEDBACK_TO_EMAIL`, `FEEDBACK_FROM_EMAIL`
- Package: resend
- Current: 6.17.2
- Latest: 6.32.0
- Advisories: none
- Bump: minor
- Upgrade risk: low
- Breakage: The route calls `new Resend(apiKey)` and `resend.emails.send({ from, to, subject, text, replyTo })`. Releases 6.18.0 through 6.32.0 add `resend.suppressions` and `emails.share()` and do not remove `emails.send` or `replyTo`.
- Checked: 2026-10-02
- Status: active

#### Notes

### Unity LevelPlay

- Role: Advertising for the Word Guess Android app. The website does not sell display ads.
- Workspace: apps/web
- Where used: `apps/web/src/lib/app-ads.ts`, `apps/web/src/app/app-ads.txt/route.ts`, `apps/web/src/app/word-guess/policy/page.tsx`, `apps/web/src/app/privacy/page.tsx`, `apps/web/src/app/about/page.tsx`, `apps/web/src/app/terms/page.tsx`
- Config names: `NEXT_PUBLIC_LEVELPLAY_PUBLISHER_ID`
- Package: none
- Current: none
- Latest: none
- Advisories: none
- Bump: current
- Upgrade risk: low
- Breakage: No package pin. Seller lines are assembled in `apps/web/src/lib/app-ads.ts`.
- Checked: 2026-10-02
- Status: active

#### Notes

## Direct dependencies

| Package | Workspace | Current | Latest | Advisories | Bump | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| electron | apps/desktop | 42.5.0 | 44.5.1 | high | major | |
| electron-builder | apps/desktop | 26.15.3 | 26.15.3 | none | current | See Integrations |
| electron-updater | apps/desktop | 6.8.9 | 6.8.9 | none | current | See Integrations |
| typescript | apps/desktop | 5.9.3 | 7.0.2 | none | major | |
| @react-native-async-storage/async-storage | apps/mobile | 2.2.0 | 3.1.1 | none | major | |
| @types/react | apps/mobile | 19.2.17 | 19.3.0 | none | minor | |
| expo | apps/mobile | 56.0.12 | 57.0.26 | high | major | |
| expo-constants | apps/mobile | 56.0.18 | 57.0.20 | none | major | |
| expo-linking | apps/mobile | 56.0.14 | 57.0.11 | none | major | |
| expo-router | apps/mobile | 56.2.11 | 57.0.24 | moderate | major | |
| expo-status-bar | apps/mobile | 56.0.4 | 57.0.1 | none | major | |
| react | apps/mobile | 19.2.7 | 19.3.0 | none | minor | |
| react-native | apps/mobile | 0.85.3 | 0.87.1 | none | minor | |
| react-native-gesture-handler | apps/mobile | 2.31.2 | 3.3.0 | none | major | |
| react-native-reanimated | apps/mobile | 4.3.1 | 4.7.1 | none | minor | |
| react-native-safe-area-context | apps/mobile | 5.7.0 | 5.10.1 | none | minor | |
| react-native-screens | apps/mobile | 4.25.2 | 4.28.0 | none | minor | |
| react-native-worklets | apps/mobile | 0.8.3 | 0.13.0 | none | minor | |
| typescript | apps/mobile | 5.9.3 | 7.0.2 | none | major | |
| @types/cors | apps/server | 2.8.19 | 2.8.19 | none | current | |
| @types/express | apps/server | 5.0.6 | 5.0.6 | none | current | |
| @types/node | apps/server | 24.13.2 | 26.6.4 | none | major | |
| @types/ws | apps/server | 8.18.1 | 8.18.2 | none | patch | |
| cors | apps/server | 2.8.6 | 2.8.6 | none | current | |
| express | apps/server | 5.2.1 | 5.2.1 | none | current | |
| tsx | apps/server | 4.22.4 | 4.23.15 | none | minor | |
| typescript | apps/server | 5.9.3 | 7.0.2 | none | major | |
| ws | apps/server | 8.21.0 | 8.22.0 | none | minor | |
| @opennextjs/cloudflare | apps/web | 1.20.0 | 1.20.7 | none | patch | See Integrations |
| @remixicon/react | apps/web | 4.9.0 | 4.9.0 | none | current | |
| @stdlib/datasets-female-first-names-en | apps/web | 0.2.3 | 0.2.3 | none | current | |
| @stdlib/datasets-male-first-names-en | apps/web | 0.2.3 | 0.2.3 | none | current | |
| @tailwindcss/postcss | apps/web | 4.3.1 | 4.3.3 | moderate | patch | |
| @testing-library/dom | apps/web | 10.4.1 | 10.4.2 | none | patch | |
| @testing-library/jest-dom | apps/web | 6.9.1 | 7.0.1 | none | major | |
| @testing-library/react | apps/web | 16.3.2 | 16.3.3 | none | patch | |
| @types/node | apps/web | 24.13.2 | 26.6.4 | none | major | |
| @types/react | apps/web | 19.2.17 | 19.3.0 | none | minor | |
| @types/react-dom | apps/web | 19.2.3 | 19.3.0 | none | minor | |
| all-the-cities | apps/web | 3.1.0 | 3.1.0 | none | current | |
| an-array-of-english-words | apps/web | 2.0.0 | 2.0.0 | none | current | |
| class-variance-authority | apps/web | 0.7.1 | 0.7.1 | none | current | |
| clsx | apps/web | 2.1.1 | 2.1.1 | none | current | |
| country-list | apps/web | 2.4.1 | 2.4.1 | none | current | |
| eslint | apps/web | 9.39.4 | 10.11.0 | none | major | |
| eslint-config-next | apps/web | 16.2.9 | 16.3.8 | none | minor | |
| jsdom | apps/web | 29.1.1 | 30.1.1 | none | major | |
| lucide-react | apps/web | 1.21.0 | 1.50.0 | none | minor | |
| next | apps/web | 16.2.9 | 16.3.8 | critical | minor | |
| nuqs | apps/web | 2.8.9 | 2.10.1 | none | minor | |
| popular-english-words | apps/web | 1.0.2 | 1.0.2 | none | current | |
| prettier | apps/web | 3.8.4 | 3.9.9 | none | minor | |
| prettier-plugin-tailwindcss | apps/web | 0.8.0 | 0.8.1 | none | patch | |
| radix-ui | apps/web | 1.6.0 | 1.6.7 | none | patch | |
| react | apps/web | 19.2.7 | 19.3.0 | none | minor | |
| react-dom | apps/web | 19.2.7 | 19.3.0 | none | minor | |
| resend | apps/web | 6.17.2 | 6.32.0 | none | minor | See Integrations |
| shadcn | apps/web | 4.11.0 | 4.21.1 | none | minor | |
| tailwind-merge | apps/web | 3.6.0 | 3.7.0 | none | minor | |
| tailwindcss | apps/web | 4.3.1 | 4.3.3 | none | patch | |
| tw-animate-css | apps/web | 1.4.0 | 1.4.0 | none | current | |
| typescript | apps/web | 5.9.3 | 7.0.2 | none | major | |
| vitest | apps/web | 4.1.9 | 5.0.3 | moderate | major | |
| wrangler | apps/web | 4.104.0 | 4.147.0 | moderate | minor | See Integrations |
| typescript | packages/api-client | 5.9.3 | 7.0.2 | none | major | |
| vitest | packages/api-client | 4.1.9 | 5.0.3 | moderate | major | |
| typescript | packages/domain | 5.9.3 | 7.0.2 | none | major | |
| vitest | packages/domain | 4.1.9 | 5.0.3 | moderate | major | |
| typescript | packages/storage | 5.9.3 | 7.0.2 | none | major | |

## Retired

### Google AdSense

- Role: Served website display ads and `/ads.txt`.
- Workspace: apps/web
- Where used: removed (`adsense-script`, `ad-panel`, `adsense.ts`, `app/ads.txt/route.ts`)
- Config names: `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_TOP`, `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM`, `NEXT_PUBLIC_ADSENSE_SLOT_HUB` (removed from `wrangler.jsonc`)
- Package: none
- Current: none
- Latest: none
- Advisories: none
- Bump: current
- Upgrade risk: low
- Breakage: Website slots and `/ads.txt` are gone. Word Guess Android ads stay on Unity LevelPlay (`/app-ads.txt`, `/word-guess/policy`).
- Checked: 2026-10-02
- Status: retired

#### Notes

