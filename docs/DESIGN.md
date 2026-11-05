# Pasttime — Hub design direction

Visual references (not copies):

- [Party Games (Play Party Play)](https://www.playpartyplay.com/) — bold hero, trust badges, card grid with player count / duration, section rails (“Top Picks”, “Crowd Favourites”), category browse.
- [NYT Games / Crosswords](https://www.nytimes.com/crosswords) — calm editorial tone, game tiles as primary navigation, clear hierarchy, minimal chrome.

## Hub (`/`) — combined direction

| Element | Direction |
|---------|-----------|
| **Hero** | Short headline + one-line subcopy (Party Play energy, NYT restraint). No autoplay video. |
| **Trust row** | 3–4 compact badges: instant play, no download, works on mobile/desktop, free (MVP truths only). |
| **Sections** | “Top picks” (the three playable games with the most page views; manual `featured` games when those totals are missing), “All games” grid. Optional tags later. |
| **Roadmap visibility** | Show full planned catalog on hub with clear `Coming soon` badges for backlog entries. |
| **Cards** | Icon, title, description, meta line (`playerCount` · `duration`), status badge (`Coming soon` / `Play`). shadcn `Card` + `Badge`. Marks stay white on the colored header and share one glyph size. Most games use a Lucide glyph. Word Guess is a 3×3 tile grid (solid, shaded, and hollow). Tongits is a three-card fan (outline, shaded, solid, right card on top). Pusoy Dos is a square outline with a 2 and a hollow diamond. |
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
