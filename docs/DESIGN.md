# Pasttime — Hub design direction

Visual references (not copies):

- [Party Games (Play Party Play)](https://www.playpartyplay.com/) — bold hero, trust badges, card grid with player count / duration, section rails (“Top Picks”, “Crowd Favourites”), category browse.
- [NYT Games / Crosswords](https://www.nytimes.com/crosswords) — calm editorial tone, game tiles as primary navigation, clear hierarchy, minimal chrome.

## Hub (`/`) — combined direction

| Element | Direction |
|---------|-----------|
| **Hero** | Short headline + one-line subcopy (Party Play energy, NYT restraint). No autoplay video. |
| **Trust row** | 3–4 compact badges: instant play, no download, works on mobile/desktop, free (MVP truths only). |
| **Sections** | “Top picks” (featured `available` or highlighted registry entries), “All games” grid. Optional tags later. |
| **Cards** | Icon, title, description, meta line (`playerCount` · `duration`), status badge (`Coming soon` / `Play`). shadcn `Card` + `Badge`. |
| **Layout** | Max-width container, responsive grid (1 → 2 → 3 cols), comfortable whitespace. |
| **Nav** | Sticky header: wordmark, browse link (future), theme toggle (Phase 4 polish). |
| **Filter** | Production: URL `?status=` + server-rendered list. MVP slice may use client filter first. |
| **Typography** | Geist (already in layout). Headings medium weight; body muted for secondary text. |
| **Color** | shadcn oklch tokens only — no trademark-adjacent game greens in the hub shell. |

## Game shell (`/games/[slug]`)

- Centered placeholder: game title, “Coming soon”, link back to hub.
- Same header/footer as hub for consistency.

## Out of scope for hub MVP

- Ads, auth, multiplayer lobby UI, category mega-menu like full Party Play library.
