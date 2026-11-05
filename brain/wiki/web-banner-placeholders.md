# Web banner placeholders
updated: 2026-11-05
tags: [monetization, layout]
related: [adsense-manual-units, levelplay-app-ads, engineering-decisions]

Reserved boxes for a future website banner network. Nothing is filled. There is no ad script and no `/ads.txt`. Google AdSense stays retired. Word Guess Android stays on Unity LevelPlay in `/app-ads.txt`. Do not copy those reseller lines into a website seller file.

## Header

`BannerPlaceholder` is the last child of the sticky header, so it pins with the wordmark on every page, including play.

| Viewport | Box |
|----------|-----|
| md and up | 728×90 |
| narrower | 320×50 |
| height 500px or less | hidden |

## Left rail

`PageSideBanner` is one fixed 160×600 rail at `lg` and up. It sits in `SiteShell`, out of the column, so the column stays centered. Its left edge is `1.5rem` from the viewport, the same inset as the header.

On a play screen the top matches `[data-play-field]`, the box that holds the board, not the game title. `GamePlaySection` marks that box. Type Rush marks its card directly because it does not use the section. The rail stays hidden until that box has been measured, so the first paint does not sit on the title. A stage that is already too wide sets `sideBanner={false}` on `GamePlayShell`, which marks `data-side-banner="off"`. Type Shield does.

On every other page the top matches the page title. The rail stays off when the column would run under it, so the hub grid and a short window do not cover copy. About, terms, privacy, and the other text pages pick it up from `SiteShell`.

## Left out

No footer banner. No second rail. No live network tag.

## No traffic-floor ranking

Checked 2026-11-05. Networks with a published pageview, session, visitor, or monthly-user floor are out. That removes Nitro (100,000 pageviews), Playwire (500,000), Ezoic (250,000 monthly users), Setupad (about 100,000 visitors), Clickio (100,000 and up by country), plus Venatus, Publisher Collective, Mediavine, Journey, and Raptive. AdSense stays out by the earlier decision, even though Google publishes no pageview number.

| Rank | Network | Why |
|------|---------|-----|
| 1 | Sovrn Ad Exchange | Display auction. No published traffic floor. Free account, then a quality review. Pay is the winning bid. $25 balance, Net 45. Seller lines go in `/ads.txt` only. |
| 2 | Adsterra, banners only | No published traffic floor and a free account. Turn on banner CPM and leave pop and push off. Weaker advertisers than Sovrn. |
| 3 | Media.net | No published traffic floor. Their display product is priced on clicks, so it is last for an exposure goal. |

Carbon Ads publishes no floor, and its sponsors buy design and developer pages, so a game catalog is a poor fit. It is not ranked.

Sovrn is the network to set up. One tag. Adsterra and Media.net stay off the page.

## Sovrn setup

Do not ship the tags until the site is approved. Account creation is free. Decline a setup invoice, a deposit, or a required plan.

Sources: [getting started](https://knowledge.sovrn.com/kb/getting-started-with-sovrn-ad-exchange), [ads.txt](https://knowledge.sovrn.com/kb/ads-txt-and-sovrn-ad-exchange), [ad tags](https://knowledge.sovrn.com/kb/ad-tags-in-ad-exchange), [sizes](https://knowledge.sovrn.com/kb/how-to-select-display-ad-sizes-for-your-site-layou), [payments](https://knowledge.sovrn.com/kb/payments-in-ad-exchange).

### Account and ads.txt

- [ ] Create a Sovrn account and choose Publisher. `pasttime.xyz` is owned here, so the seller type is DIRECT.
- [ ] Submit `pasttime.xyz` only. The site must be public. The review is often 24–72 hours.
- [ ] Copy the ads.txt block from the Sovrn dashboard into a Worker route at `/ads.txt`. Serve it as plain text. Do not 301 that path to a hosted file.
- [ ] Keep `ownerdomain=pasttime.xyz` on the first line of that file.
- [ ] Leave `/app-ads.txt` as the Unity LevelPlay file. Do not copy those reseller lines into `/ads.txt`.
- [ ] Do not add an AdSense line, an Adsterra line, or a Nitro line.

### Placements

After approval, create tags under Advertising. Their strongest sizes are 728×90, 300×250, and 160×600. This layout uses two of those and skips the square. Leave the CPM floor at $0.00 for the first few weeks. Each placement gets its own tag id.

- [ ] Header tag in `BannerPlaceholder`: 728×90 from the `md` breakpoint, 320×50 below that, hidden when the viewport is 500px tall or shorter. It stays pinned with the header, including on play. If 320×50 is missing from their size list, leave the phone box empty.
- [ ] Rail tag in `PageSideBanner`: 160×600 at `lg` and up, `1.5rem` from the left edge. On play, the top aligns to `[data-play-field]`. On other pages, the top aligns to the title, and the rail stays off when the column would run under it. Type Shield keeps `sideBanner={false}`.
- [ ] Use the tag snippet Sovrn generates for that placement. Do not add a Prebid wrapper beside it.
- [ ] Confirm the tag still requests an ad after a Next.js route change. The header and the rail stay mounted across those changes.
- [ ] An empty box is an unfilled auction. Sovrn does not fill every request. Do not add their suggested AdSense passback.

### Legal copy

Privacy, about, and terms still say the website shows no display ads and sets no advertising cookies. Change those sentences in the same change as the tags. Keep the Word Guess Android LevelPlay disclosure.

- [ ] Privacy, about, and terms name Sovrn for website ads.
- [ ] The site has a "Do Not Sell My Personal Information" link for US visitors.
- [ ] If EU/EEA traffic is real, add a consent tool and pass the consent string the tag expects. Do not add a second ad network's consent script.

### After it is live

- [ ] `https://pasttime.xyz/ads.txt` returns 200 with the Sovrn lines and `ownerdomain=pasttime.xyz`. The body has no LevelPlay line.
- [ ] `https://pasttime.xyz/app-ads.txt` is still the LevelPlay file.
- [ ] The game still loads when a box is empty.
- [ ] Judge Sovrn on dollars collected, not on a higher CPM from a raised floor. A higher floor fills less.
- [ ] Payout is a $25 balance, then Net 45. A wire uses $50. Amounts under the line roll into the next month.
