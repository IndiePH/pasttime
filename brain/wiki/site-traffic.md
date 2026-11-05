# Site traffic
updated: 2026-11-05
tags: [analytics, privacy, cloudflare, d1]
related: [engineering-decisions]

Daily page views and visitors by country for pasttime.xyz. Aggregate counts only.

## What is stored

D1 database `pasttime-lexicon`, table `site_traffic_daily` (migration `apps/web/migrations/0002_site_traffic.sql`).

| column | meaning |
|--------|---------|
| day | UTC date `YYYY-MM-DD` |
| country | Cloudflare edge code, such as `US`. `XX` is unknown. `T1` is Tor |
| path | Pathname only. `/traffic` and `/api/*` are excluded |
| views | Page loads |
| visitors | Browsers seen for the first time that UTC day. The increment lands on the first page of the day, so a country total is `SUM(visitors)` |

No IP address, user id, or per-browser history is written. The privacy page describes this.

## How a view is counted

`TrafficBeacon` in the root layout POSTs the pathname to `/api/traffic` on each client navigation. The route reads `cf.country`, then the `CF-IPCountry` header. It ignores other origins and known crawler user agents. Cookie `pt_hit` drops a repeat of the same path for 30 seconds. Cookie `pt_seen` is the UTC day already counted.

Local `next dev` writes to the local D1 database after `npm run lexicon:migrate:local` from `apps/web`. If `site_traffic_daily` is missing, the beacon still returns 204 and that view is dropped.

## Top picks

The hub Top picks row is the three playable games with the most views. Landing, play, stats, and room paths for one game are added together. Order is highest views first, then title when counts match. If the traffic table is missing or no playable game has a view, the row stays the manual `featured` games.

## How to read it

`/traffic` is noindex and disallowed in `robots.txt`. It asks for `TRAFFIC_VIEW_KEY` (`.env.local` locally, Worker secret in production). The key is not in `secrets.required`, so a deploy still succeeds if the secret is missing; counts still record and the page explains that the key is unset.

Ranges are 7, 30, and 90 days. Visitors are browsers, not people.

Apply the table from `apps/web` with `npm run lexicon:migrate` before expecting production rows.

Production on 2026-11-04: remote migration applied, Worker `gamehub` version `02df0176-7374-4719-9571-99b9b5f7b5c2` is live, and `TRAFFIC_VIEW_KEY` is a Worker secret. The same key is in `apps/web/.env.local` only.
