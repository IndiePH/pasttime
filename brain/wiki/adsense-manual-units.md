# AdSense manual units
updated: 2026-07-17
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

## Placements & env

| Logical slot | Env var | Reserved size |
|--------------|---------|---------------|
| `global-top-strip` | `NEXT_PUBLIC_ADSENSE_SLOT_TOP` | 728×90 |
| `global-bottom-strip` | `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM` | 728×90 |
| `hub-grid-card` | `NEXT_PUBLIC_ADSENSE_SLOT_HUB` | card / ~300×250 |

- `NEXT_PUBLIC_ADSENSE_CLIENT` = `ca-pub-…` (AdSense UI may show `pub-…` — add `ca-` in env).
- `NEXT_PUBLIC_*` is baked at **build** time — set Cloudflare Worker vars, then **redeploy**.
- Unset client/slots → dashed placeholders. Removed: `static-below-header`. No side rails.

Prefer **Responsive** AdSense units (better fill than fixed); our CSS still reserves desktop sizes.

## Verification stack

| Method | Status |
|--------|--------|
| `/ads.txt` | Route serves `google.com, pub-…, DIRECT, f08c47fec0942fa0` when client set. Must work on **apex**. |
| AdSense `<script>` | `AdSenseScript` in root layout (env-gated). |
| Meta `google-adsense-account` | Not implemented; optional if ads.txt already verifies. |

Code: `apps/web/src/lib/adsense.ts`, `AdPanel`, `AdSenseScript`, `app/ads.txt/route.ts`. Spec/plan: `docs/superpowers/*adsense*`. Deploy notes: `docs/DEPLOY.md`.

## Consent (EEA / UK / CH)

Google requires a **certified CMP** for personalized ads in EEA/UK/CH. Choice for Pasttime: **Google’s CMP**, **3 choices** (Consent / Do not consent / Manage options) — not a third-party CMP yet. See [AdSense CMP requirements](https://support.google.com/adsense/answer/13554116).

## Operator checklist

1. Create 3 Display (Responsive) units when Ads → By ad unit is available (hidden until account/UI ready).
2. Set four Cloudflare env vars on Worker `gamehub` → redeploy.
3. Confirm `https://pasttime.xyz/ads.txt` and gamehub variant.
4. AdSense Sites = apex; submit for review; wait Ready (ads may stay empty until then).
5. Keep Google CMP consent message published for future sites.
