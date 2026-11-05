# Web banner placements
updated: 2026-11-05
tags: [monetization, layout]
related: [adsense-manual-units, levelplay-app-ads, engineering-decisions]

The website header and left rail load approved Adsterra display-banner tags.
Google AdSense stays retired. Word Guess Android stays on Unity LevelPlay in
`/app-ads.txt`. Do not copy the Android seller list into a website seller file.

## Header

`BannerPlaceholder` is the last child of the sticky header, so it stays with
the wordmark on every page, including play.

| Viewport | Unit |
|----------|-----|
| md and up | Adsterra 728×90 |
| narrower | Adsterra 320×50 |
| height 500px or less | hidden |

## Left rail

`PageSideBanner` loads the Adsterra 160×600 unit at `lg` and up. It sits in
`SiteShell`, outside the centered column, with its left edge `1.5rem` from the
viewport.

On play screens its top aligns with `[data-play-field]`; elsewhere it aligns
with the page title. It stays off when the viewport or game stage does not leave
enough room. Type Shield explicitly disables the rail.

On every other page the top matches the page title. The rail stays off when the column would run under it, so the hub grid and a short window do not cover copy. About, terms, privacy, and the other text pages pick it up from `SiteShell`.

## Boundaries and diagnostics

There is no footer banner, second rail, popunder, push notification, or
Adsterra BOOST CPM format.

The tags are client-side scripts from `https://bauval.org`. They do not depend
on `/ads.txt`; `https://pasttime.xyz/ads.txt` intentionally remains a 404.
`/app-ads.txt` is a separate Unity LevelPlay file for the Android app.

An empty box does not by itself mean the integration is broken. Adsterra may
return an empty response for an embedded or automated browser, an ad blocker,
or a visitor for whom there is no eligible campaign. A clean Chrome test should
show a 728×90 iframe when the provider returns a creative. The Cursor embedded
browser has returned an empty script for these tags.

The banner components mount one unit at a time because Adsterra reads the
global `atOptions` value while its loader executes. A failed or empty load gets
one delayed retry; a loaded ad is never periodically refreshed. Do not paste
multiple raw snippets into the same page or add a second ad network beside
these units.
