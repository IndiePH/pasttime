# AdSense Manual Units — Design

Date: 2026-07-16  
Status: approved (pending implementation plan)

## Goal

Replace desktop ad placeholders with live Google AdSense **manual display units** on production (`gamehub.pasttime.xyz`), while keeping placeholders when AdSense env is unset (local / preview).

## Decisions

| Decision | Choice |
|----------|--------|
| Network | Google AdSense |
| Placement mode | Manual units only (no Auto ads) |
| Platforms (this pass) | Non-mobile browser (desktop) |
| Live slots | `global-top-strip`, `global-bottom-strip`, `hub-grid-card` |
| Removed | `static-below-header` |
| Side rails | Out of scope (too aggressive for current layout) |
| Config | Env-driven publisher + per-slot IDs |

## Placements & reserved sizes

| Slot key | Where | Reserved size (desktop) |
|----------|--------|-------------------------|
| `global-top-strip` | `SiteShell` below header | 728×90 |
| `global-bottom-strip` | `SiteShell` above footer | 728×90 |
| `hub-grid-card` | Hub catalog grid | Match game card; typical fill 300×250 |

## Architecture

1. **Env config** (Cloudflare Worker / `.env` for local):
   - `NEXT_PUBLIC_ADSENSE_CLIENT` — publisher ID (`ca-pub-…`)
   - `NEXT_PUBLIC_ADSENSE_SLOT_TOP` — ad unit ID for top strip
   - `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM` — ad unit ID for bottom strip
   - `NEXT_PUBLIC_ADSENSE_SLOT_HUB` — ad unit ID for hub card

2. **Script load** — Include the AdSense script once in the root layout only when `NEXT_PUBLIC_ADSENSE_CLIENT` is set.

3. **`AdPanel`** — Maps logical `slot` → env slot ID. If client + slot ID present, render responsive `<ins class="adsbygoogle">` inside the reserved box and call `adsbygoogle.push({})`. Otherwise render the existing dashed placeholder (with size label).

4. **`ads.txt`** — Static (or route) at `/ads.txt` with the standard AdSense publisher line so site verification / authorization can complete.

5. **Future (out of scope)** — Separate mobile unit IDs; consent CMP for EU; play-screen ads; Auto ads; side rails.

## Behavior

- **Production with all env set** → three live units in fixed placements.
- **Env unset** → placeholders only; no AdSense script.
- **Unfilled / unapproved site** → empty reserved boxes (no layout collapse).
- Do not request ads for `display: none` slots (relevant when mobile units are added later).

## Operator steps (outside code)

1. Ensure **apex** `pasttime.xyz` is added in AdSense → Sites (subdomain-only URLs are rejected). Keep apex on the Worker custom domain while review is pending.
2. Create three **Display** ad units (responsive) named to match slots.
3. Copy publisher ID + three data-ad-slot values into Cloudflare env; redeploy (NEXT_PUBLIC_* is build-time).
4. Confirm `/ads.txt` on apex + gamehub; confirm `/privacy` discloses AdSense + Google partner-sites link; `/about` and `/terms` are real copy (not placeholders).
5. Request site review; units may stay blank until approval.

## Testing

- Unit/component: `AdPanel` shows placeholder when env missing; renders `ins` + `data-ad-slot` when configured (mock env).
- Manual: production deploy with env; hub + shell show three units; static pages have no ad under title.
- Regression: hub grid layout and site shell spacing unchanged when ads empty.
- Review readiness: `/privacy`, `/about`, `/terms` are substantive (Publisher Policies / privacy disclosures).

## Non-goals

- Hardcoding publisher/slot IDs in the repo
- Auto ads or GPT/Ad Manager
- Changing game play UIs to insert ads
