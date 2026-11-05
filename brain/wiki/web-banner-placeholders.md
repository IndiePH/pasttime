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

## Play rail

`PlaySideBanner` is a fixed 160×600 rail on play screens at `lg` and up. It is out of the board's flex row, so the board stays centered. Its left edge is `1.5rem` from the viewport, the same inset as the header. Its top matches `[data-play-field]`, the box that holds the board, not the game title.

`GamePlaySection` marks that box. Type Rush marks its card directly because it does not use the section. A stage that is already too wide passes `sideBanner={false}`. Type Shield does.

The rail is hidden until that box has been measured, so the first paint does not sit on the title.

## Left out

No footer banner. No hub-grid card. No second rail. No live network tag.
