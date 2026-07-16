---
title: AdSense manual units
updated: 2026-07-16
related:
  - engineering-decisions
---

# AdSense manual units

Pasttime (`gamehub.pasttime.xyz`) uses **manual Google AdSense display units** only (no Auto ads). Desktop slots:

| Logical slot | Env var | Reserved size |
|--------------|---------|---------------|
| `global-top-strip` | `NEXT_PUBLIC_ADSENSE_SLOT_TOP` | 728×90 |
| `global-bottom-strip` | `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM` | 728×90 |
| `hub-grid-card` | `NEXT_PUBLIC_ADSENSE_SLOT_HUB` | card / ~300×250 |

Publisher: `NEXT_PUBLIC_ADSENSE_CLIENT` (`ca-pub-…`; UI may show `pub-…` — add `ca-` in env).

Code: `apps/web/src/lib/adsense.ts`, `AdPanel`, `AdSenseScript`, `/ads.txt` route. Unset env → placeholders. Spec/plan under `docs/superpowers/`.
