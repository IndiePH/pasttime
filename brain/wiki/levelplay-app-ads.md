# LevelPlay app-ads

updated: 2026-11-05
tags: [monetization, levelplay, devops]
related: [adsense-manual-units, engineering-decisions, web-banner-placeholders]

Word Guess on Android uses **Unity LevelPlay**. Website banners are Adsterra, documented in [web-banner-placeholders](web-banner-placeholders.md). There is no Google AdSense script or slot. `/ads.txt` is still unserved. `/app-ads.txt` stays the LevelPlay file.

## What replaced the website units

| Former AdSense surface | Replacement |
|------------------------|-------------|
| Top strip | Adsterra header banner. Not AdSense. |
| Bottom strip, hub card | Not reserved. |
| Browser grid | LevelPlay still runs in the Android app, not in the browser. |
| `/ads.txt` | Not served. App crawlers use `/app-ads.txt`. Do not copy LevelPlay reseller lines into a website `ads.txt`. |
| Privacy, About, Terms AdSense copy | Website pages name Adsterra for banners and still point at `/word-guess/policy` for the app. |
| AdSense env vars in `wrangler.jsonc` | Removed. Publisher ID is code in `apps/web/src/lib/app-ads.ts`. |

## Files

| Path | Role |
|------|------|
| `https://pasttime.xyz/app-ads.txt` | Apex seller file. Play Console Website is `pasttime.xyz` (path is stripped). |
| `apps/web/src/lib/app-ads.ts` | `ownerdomain`, ironSource DIRECT, Unity Ads DIRECT mirror |
| `apps/web/src/lib/app-ads-unity-list.ts` | Unity dashboard reseller list |
| `apps/web/src/app/word-guess/policy/page.tsx` | In-repo LevelPlay privacy disclosure |
| Play listing | `https://yoxent.github.io/word-guess/privacy` |

Do not put ironSource Access, Secret, or Refresh keys in env files or Worker vars.

## Apex

`pasttime.xyz` must stay a Worker custom domain on `gamehub`. DNS for the zone is not the same thing as the Worker custom domain. The LevelPlay crawler fetches the apex `/app-ads.txt`.
