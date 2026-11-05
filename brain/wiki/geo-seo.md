# GEO and SEO
updated: 2026-11-05
tags: [seo, geo, nextjs]
related: [engineering-decisions, site-traffic]

Pasttime’s indexable pages are the apex hub, game landings, about, privacy, terms, and `/word-guess/policy`. Play, stats, and room stay `noindex` and remain followable.

## What answer engines should cite

- Landing copy in `game-overviews.ts` and the How To Play disclosure. The disclosure is one control, and its rules are in the initial HTML.
- Hub questions from `hubFaqs()`. The visible paragraphs and `FAQPage` JSON-LD use those same strings.
- `https://pasttime.xyz/llms.txt`, built by `buildLlmsTxt()` from the registry and those landing sentences.

`/games` renders the same hub as `/`. Its canonical is the apex, and the sitemap does not list it.

## Crawl files

- `robots.ts`: `*` may read the site except `/traffic` and `/api/traffic`. Named AI crawlers also skip play, stats, and room. Googlebot is not in that named group, so it can still see `noindex`.
- `sitemap.ts`: `lastmod` is `SITE_CONTENT_UPDATED` in `apps/web/src/lib/seo.ts`. Bump that date when public copy or the indexable URL set changes. Do not stamp `new Date()` on each request.

## Structured data

`websiteJsonLd` is the organization and website, including the title search at `/?q=`. Game landings add `WebApplication` and a visible Home / title breadcrumb. The hub adds an `ItemList` of playable games.
