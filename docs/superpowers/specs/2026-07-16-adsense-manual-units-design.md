# AdSense Manual Units — Design

Date: 2026-07-16  
Status: implemented (env + units wired; apex ads.txt needs redeploy after wrangler `vars`)

## Goal

Replace desktop ad placeholders with live Google AdSense **manual display units** on production (`pasttime.xyz` / `gamehub.pasttime.xyz`), while keeping placeholders when AdSense env is unset (local / preview).

## Decisions

| Decision | Choice |
|----------|--------|
| Network | Google AdSense |
| Placement mode | Manual units only (no Auto ads) |
| Platforms (this pass) | Non-mobile browser (desktop) |
| Live slots | `global-top-strip`, `global-bottom-strip`, `hub-grid-card` |
| AdSense unit names | `pasttime-global-top-strip`, `pasttime-global-bottom-strip`, `pasttime-hub-grid-card` |
| Removed | `static-below-header` |
| Side rails | Out of scope (too aggressive for current layout) |
| Config | `NEXT_PUBLIC_*` in `wrangler.jsonc` `vars` (prod) + `.env.local` (local); Resend stays Worker secrets |

## Placements & reserved sizes

| Slot key | AdSense unit name | Where | Reserved size (desktop) |
|----------|-------------------|--------|-------------------------|
| `global-top-strip` | `pasttime-global-top-strip` | `SiteShell` below header | 728×90 |
| `global-bottom-strip` | `pasttime-global-bottom-strip` | `SiteShell` above footer | 728×90 |
| `hub-grid-card` | `pasttime-hub-grid-card` | Hub catalog grid | Match game card; typical fill 300×250 |

## Architecture

1. **Env config**:
   - `NEXT_PUBLIC_ADSENSE_CLIENT` — publisher ID (`ca-pub-…`; UI may show `pub-…` only)
   - `NEXT_PUBLIC_ADSENSE_SLOT_*` — **numeric** ad unit IDs (not unit name strings)
   - Production: `apps/web/wrangler.jsonc` `vars` (survives deploy; public IDs)
   - Local: `.env.local` (gitignored)
   - Do not document or commit Resend secrets here

2. **Script load** — Include the AdSense script once in the root layout only when `NEXT_PUBLIC_ADSENSE_CLIENT` is set.

3. **`AdPanel`** — Maps logical `slot` → env slot ID. If client + slot ID present, render responsive `<ins class="adsbygoogle">` inside the reserved box and call `adsbygoogle.push({})`. Otherwise render the existing dashed placeholder (with size label).

4. **`ads.txt`** — Route at `/ads.txt` with the standard AdSense publisher line so site verification / authorization can complete.

5. **Future (out of scope)** — Separate mobile unit IDs; play-screen ads; Auto ads; side rails. CMP: Google 3-choice (see wiki).

## Behavior

- **Production with all env set** → three live units in fixed placements.
- **Env unset** → placeholders only; no AdSense script.
- **Unfilled / unapproved site** → empty reserved boxes (no layout collapse).
- Do not request ads for `display: none` slots (relevant when mobile units are added later).

## Operator steps (outside code)

1. Ensure **apex** `pasttime.xyz` is added in AdSense → Sites (subdomain-only URLs are rejected). Keep apex on the Worker custom domain while review is pending.
2. Create three **Display** ad units (responsive) with the unit names above; copy **numeric** IDs into wrangler `vars` + local env.
3. Redeploy (NEXT_PUBLIC_* is build-time). Confirm `/ads.txt` on apex + gamehub.
4. Confirm `/privacy` discloses AdSense + Google partner-sites link; `/about` and `/terms` are real copy (not placeholders).
5. Request site review; units may stay blank until approval.

See `brain/wiki/adsense-manual-units.md` and `docs/DEPLOY.md` for secrets vs vars and deploy wipe behavior.

## Testing

- Unit/component: `AdPanel` shows placeholder when env missing; renders `ins` + `data-ad-slot` when configured (mock env).
- Manual: production deploy with env; hub + shell show three units; static pages have no ad under title.
- Regression: hub grid layout and site shell spacing unchanged when ads empty.
- Review readiness: `/privacy`, `/about`, `/terms` are substantive (Publisher Policies / privacy disclosures).

## Non-goals

- Putting Resend / feedback secrets in `vars`, git, or docs
- Auto ads or GPT/Ad Manager
- Changing game play UIs to insert ads
- Using AdSense unit **names** as `data-ad-slot` values (must be numeric IDs)