# Web banner placeholders
updated: 2026-11-06
tags: [monetization, layout]
related: [adsense-manual-units, levelplay-app-ads, engineering-decisions]

The header and the left rail load Adsterra display banners from `adsterra-banner.tsx`. The canonical public website host is `pasttime.xyz`; `gamehub.pasttime.xyz` is not a production URL. Adsterra returns an empty script for any other host, including localhost, so the box stays blank there. The website `/ads.txt` route now contains Adsterra's standard direct-seller line and still needs deployment. Google AdSense stays retired. Word Guess Android stays on Unity LevelPlay in `/app-ads.txt`. Do not copy those reseller lines into a website seller file. Anti-Adblock stays off. Do not paste the replacement codes from that email.

## Header

`BannerPlaceholder` is the last child of the sticky header, so it pins with the wordmark on every page, including play. It loads one Adsterra banner: 728×90 from `md`, 320×50 below that.

| Viewport | Box |
|----------|-----|
| md and up | 728×90 |
| narrower | 320×50 |
| height 500px or less | hidden |

## Left rail

`PageSideBanner` is one fixed 160×600 rail at `lg` and up. It sits in `SiteShell`, out of the column, so the column stays centered. Its left edge is `1.5rem` from the viewport, the same inset as the header. The Adsterra skyscraper mounts only when the measured height is a full 600px.

On a play screen the top matches `[data-play-field]`, the box that holds the board, not the game title. `GamePlaySection` marks that box. Type Rush marks its card directly because it does not use the section. The rail stays hidden until that box has been measured, so the first paint does not sit on the title. A stage that is already too wide sets `sideBanner={false}` on `GamePlayShell`, which marks `data-side-banner="off"`. Type Shield does.

On every other page the top matches the page title. The rail stays off when the column would run under it, so the hub grid and a short window do not cover copy. About, terms, privacy, and the other text pages pick it up from `SiteShell`.

## Left out

No footer banner. No second rail. No popunder, smartlink, native banner, or social bar.

## No traffic-floor ranking

Checked 2026-11-05. Networks with a published pageview, session, visitor, or monthly-user floor are out. That removes Nitro (100,000 pageviews), Playwire (500,000), Ezoic (250,000 monthly users), Setupad (about 100,000 visitors), Clickio (100,000 and up by country), plus Venatus, Publisher Collective, Mediavine, Journey, and Raptive. AdSense stays out by the earlier decision, even though Google publishes no pageview number.

| Rank | Network | Why |
|------|---------|-----|
| 1 | Sovrn Ad Exchange | Display auction. No published traffic floor. Free account, then a quality review. Pay is the winning bid. $25 balance, Net 45. Seller lines go in `/ads.txt` only. |
| 2 | Adsterra, banners only | No published traffic floor and a free account. Turn on banner CPM and leave pop and push off. Weaker advertisers than Sovrn. |
| 3 | Media.net | No published traffic floor. Their display product is priced on clicks, so it is last for an exposure goal. |

Carbon Ads publishes no floor, and its sponsors buy design and developer pages, so a game catalog is a poor fit. It is not ranked.

Adsterra is the network to set up. Sovrn's signup page returned a CloudFront 403 in Chrome and Brave with the VPN off, so that account is parked. One tag. Display banners only.

## Adsterra setup

The site is approved and the three banner snippets are mounted. Account creation was free. Decline a setup invoice, a deposit, a required plan, and Anti-Adblock.

Sources: [publisher signup](https://adsterra.com/publishers/), [add a website](https://adsterra.com/blog/set-up-publishers-dashboard/), [banner sizes](https://adsterra.com/blog/how-banner-ads-make-money/), [payout](https://adsterra.com/blog/adsterra-minimum-payout-for-publishers/), [November promo](https://adsterra.com/blog/put-the-engine-to-the-test-promo/).

### November promo

[Put the Engine to the Test](https://adsterra.com/blog/put-the-engine-to-the-test-promo/) runs October 26 through November 26, 2026. A new publisher confirms the inbox invitation, places a code, and earns at least $50 in that window. Banner is one of the formats that counts. Popunder, Social Bar, and Native Banner also count, and this site does not use them. Each extra $50 is another draw chance, up to 10 chances at $500. One account, one prize. Winners are drawn by December 14 and credited by December 24.

- [x] Publisher account created.
- [ ] Open the invitation in the Adsterra inbox and confirm participation.
- [x] Use a code generated for this account. The three banner snippets are in `adsterra-banner.tsx`. The Engine applies from the first impression of that code.
- [ ] $50 of banner revenue between now and November 26 enters the draw. Do not add a pop or a push to chase the prize.
- [ ] The separate $100 social draw is optional. It needs a public post with `#AdsterraEngine` and their form before November 26.

### Account and ads.txt

- [x] Add `https://pasttime.xyz` and pick the games category if it is in the list. The site is approved.
- [x] Leave BOOST CPM off. Their own guide says turning it on allows every ad type. The live snippets are banner units.
- [x] Add only Display Banner units: 728×90, 320×50, and 160×600. Do not add a popunder, social bar, interstitial, smartlink, native unit, or 300×250.
- [x] Wait until the site status is Approved, then copy each unit's code from the dashboard. Do not edit the snippet.
- [x] Add the Adsterra seller line to the Worker route at `/ads.txt` and serve it as plain text. Do not 301 that path. The dashboard UI did not expose a separate seller block; the route uses `adsterra.com, htfw-3915, DIRECT`.
- [x] Keep `ownerdomain=pasttime.xyz` on the first line of that file.
- [x] Leave `/app-ads.txt` as the Unity LevelPlay file. Live check on 2026-11-06 returned 200 with `ownerdomain=pasttime.xyz` and LevelPlay seller lines.
- [x] Do not add an AdSense line, a Sovrn line, or a Nitro line.

### Placements

- [x] Header code in `BannerPlaceholder`: 728×90 from the `md` breakpoint, 320×50 below that, hidden when the viewport is 500px tall or shorter. It stays pinned with the header, including on play. Only the size that fits is requested.
- [x] Rail code in `PageSideBanner`: 160×600 at `lg` and up, `1.5rem` from the left edge. On play, the top aligns to `[data-play-field]`. On other pages, the top aligns to the title, and the rail stays off when the column would run under it or the measured height is under 600px. Type Shield keeps `sideBanner={false}`.
- [x] Confirm a client-side route change still requests the banner. The header and the rail are mounted again with the same two units, and a second copy is not left behind.
- [x] Retry one time when the Adsterra loader completes without creating its iframe. The retry is bounded per mount and does not reload the page or loop on blockers/no-fill. At the end of the render grace period, check again before replacing the slot so a late iframe is kept.
- [ ] An empty box is an unfilled auction. Do not fill it with a pop, a push, or an AdSense passback.

### Legal copy

Privacy, about, and terms name Adsterra for website banners. The Word Guess Android LevelPlay disclosure stays.

- [x] Privacy, about, and terms name Adsterra for website ads.
- [x] The site has a "Do Not Sell My Personal Information" link for US visitors. It points at `/privacy#do-not-sell`. The button stores `pasttime.ads.opt-out` and reloads. Global Privacy Control hides the banners too.

### Before EU/EEA delivery

- [ ] Confirm Adsterra's current consent protocol and the exact signal its banner tag accepts. Do this before enabling EU/EEA delivery; do not wait for traffic to appear.
- [ ] Choose one CMP, gate the Adsterra loader until consent or the supported non-personalized path is selected, pass the confirmed consent signal, and provide a withdrawal path. Do not add a second ad network's consent script.
- [ ] Update the website privacy copy and live verification checklist to cover the CMP, consent state, and withdrawal path.

### After it is live

- [ ] Deploy the late-iframe fallback guard from `adsterra-banner.tsx`, then recheck the header and rail on production.
- [ ] `https://pasttime.xyz/ads.txt` returns 200 with the Adsterra lines and `ownerdomain=pasttime.xyz`. The body has no LevelPlay line.
- [x] `https://pasttime.xyz/app-ads.txt` is still the LevelPlay file; live check on 2026-11-06 returned 200.
- [x] Crossword play still loads when its banner boxes are empty, and no full-page or popunder ad appeared during the live check on 2026-11-06. An empty box remains a possible no-fill result.
- [ ] Judge Adsterra on dollars from the banner units. A higher number that comes from a pop or a push does not count.
- [ ] Payout is Net 15, twice a month. Paxum pays from a $5 balance. PayPal and a local bank transfer pay from $25. A wire pays from $1,000. Amounts under the line roll forward.
