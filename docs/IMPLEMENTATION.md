# Implementation slices

Build **per route**, implement **per layer** inside each slice.

## Slice 0 — Foundation ✅

- [x] `src/` layout (`app`, `components`, `lib`, `hooks`)
- [x] L2 domain: `GameDefinition`, registry, helpers
- [x] L1 storage: adapter + `StorageProvider` in root layout
- [x] L4 placeholders: `features/hub`, `features/games`

## Slice 1 — Hub `/` ✅

See [DESIGN.md](./DESIGN.md).

- [x] L3: `card`, `badge`, `GameCard`, icons, `Header`, `Footer`, `SiteShell`, theme toggle
- [x] L4: hub hero, catalog, URL filter (`?status=`)
- [x] L5: `src/app/page.tsx` + minimal `games/[slug]` placeholder for card links
- DoD: catalog with `sample-word` / `sample-grid`, filter, links to game routes

## Slice 2 — Game shell `/games/[slug]`

- L4: `moduleRegistry`, `GamePlaceholder`
- L5: `src/app/games/[slug]/page.tsx` → `notFound()` or placeholder
- DoD: valid slug shows placeholder; invalid slug 404

## Adding a game (after slice 2)

1. Registry entry + icon in L3
2. `features/games/<id>/` module
3. Register in L4 `moduleRegistry` — no new route file
