# LevelPlay app-ads

updated: 2026-10-02
tags: [monetization, levelplay, devops]
related: [adsense-manual-units, engineering-decisions]

The website does not sell display ads. Word Guess on Android uses **Unity LevelPlay**. There is no Google AdSense script, slot, or `/ads.txt`.

## What replaced the website units

| Former AdSense surface | Replacement |
|------------------------|-------------|
| Top strip, bottom strip, hub card | Removed. LevelPlay ads run in the Android app, not in the browser grid. |
| `/ads.txt` | Not served. App crawlers use `/app-ads.txt`. Do not copy LevelPlay reseller lines into a website `ads.txt`. |
| Privacy, About, Terms AdSense copy | Website pages say the site has no display ads and point at `/word-guess/policy`. |
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
