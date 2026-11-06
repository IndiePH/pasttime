# AdSense manual units

updated: 2026-11-06
tags: [monetization, adsense]
related: [levelplay-app-ads, engineering-decisions, web-banner-placeholders]

Google AdSense was removed on 2026-10-02. Do not re-add AdSense units, an AdSense `/ads.txt`, or `NEXT_PUBLIC_ADSENSE_*` vars. The website `/ads.txt` is reserved for Adsterra seller authorization only.

The header box and the left rail are Adsterra banners. They are not AdSense. See [web-banner-placeholders](web-banner-placeholders.md).

Word Guess Android advertising is Unity LevelPlay. See [levelplay-app-ads](levelplay-app-ads.md).
