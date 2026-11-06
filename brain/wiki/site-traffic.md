# Site traffic
updated: 2026-11-06
tags: [analytics, privacy, cloudflare, d1]
related: [engineering-decisions]

Daily page views and unique browsers by country for pasttime.xyz. Aggregate counts plus one anonymous browser row per UTC day.

## What is stored

D1 database `pasttime-lexicon`.

| table | column | meaning |
|-------|--------|---------|
| `site_traffic_daily` | day | UTC date `YYYY-MM-DD` |
| `site_traffic_daily` | country | Cloudflare edge code, such as `US`. `XX` is unknown. `T1` is Tor |
| `site_traffic_daily` | path | Pathname only. `/traffic` and `/api/*` are excluded |
| `site_traffic_daily` | views | Page loads |
| `site_traffic_visitor_days` | visitor_hash | SHA-256 of the random browser cookie. The raw cookie is not stored |
| `site_traffic_visitor_days` | day | UTC date already counted for that browser |
| `site_traffic_visitor_days` | country | Edge code on the first counted page that UTC day |

`site_traffic_daily.visitors` is the retired per-day counter. New writes leave it unchanged. The `/traffic` unique-browser numbers come from `site_traffic_visitor_days` (migration `apps/web/migrations/0003_unique_traffic_visitors.sql`).

No IP address, raw browser identifier, or per-browser page history is written. The privacy page describes this. Days stored before the visitor table existed cannot be rebuilt as unique browsers.

## How a view is counted

`TrafficBeacon` in the root layout POSTs the pathname to `/api/traffic` on each client navigation. The route reads `cf.country`, then the `CF-IPCountry` header. It ignores other origins and known crawler user agents. Cookie `pt_hit` drops a repeat of the same path for 30 seconds. Cookie `pt_vid` is a random browser id kept for 400 days. Each accepted view stores a hash of that id once per UTC day. Cookie `pt_seen` is cleared and no longer used.

A browser is unique across the selected 7, 30, or 90 day range. Clearing cookies, or using another browser, starts a new count. The same browser can appear under more than one country when the edge country changes, so country totals can add up to more than the range total.

Local `next dev` writes to the local D1 database after `npm run lexicon:migrate:local` from `apps/web`. If either traffic table is missing, the beacon still returns 204 and that view is dropped.

## Top picks

The hub Top picks row is the three playable games with the most views. Landing, play, stats, and room paths for one game are added together. Order is highest views first, then title when counts match. If the traffic table is missing or no playable game has a view, the row stays the manual `featured` games.

## How to read it

`/traffic` is noindex and disallowed in `robots.txt`. It asks for `TRAFFIC_VIEW_KEY` (`.env.local` locally, Worker secret in production). The key is not in `secrets.required`, so a deploy still succeeds if the secret is missing; counts still record and the page explains that the key is unset.

Ranges are 7, 30, and 90 days. The unique-browser total counts each browser once in the range. Daily and country rows count that browser once per day or country. These are browsers, not people.

Apply the table from `apps/web` with `npm run lexicon:migrate` before deploying the unique-browser code. Until `site_traffic_visitor_days` exists, new page views are dropped.

Production on 2026-11-04: remote migration `0002_site_traffic.sql` applied, Worker `gamehub` version `02df0176-7374-4719-9571-99b9b5f7b5c2` is live, and `TRAFFIC_VIEW_KEY` is a Worker secret. The same key is in `apps/web/.env.local` only. Migration `0003_unique_traffic_visitors.sql` still has to be applied before the unique-browser deploy.
