# Playing card assets

Static SVG decks live under `public/games/cards/`. Each **variant** is a self-contained deck so games can swap art without changing game logic.

## Directory layout

```text
public/games/cards/
└── <variant>/               # e.g. minimal
    ├── back/
    │   ├── dark.svg
    │   └── light.svg
    ├── club/
    ├── diamond/
    ├── heart/
    └── spade/
        └── <rank>.svg       # ace.svg … king.svg (13 per suit)
```

| Path segment | Meaning |
|--------------|---------|
| `<variant>` | Deck art pack (`minimal` is the default) |
| `back/` | Card backs (face-down pile, stock, etc.) |
| `<suit>/` | One folder per suit — singular names: `club`, `diamond`, `heart`, `spade` |
| `<rank>.svg` | Face art — word ranks: `ace`, `two` … `ten`, `jack`, `queen`, `king` |

## Public URLs

Served from site root (no `public/` prefix):

- Face: `/games/cards/<variant>/<suit>/<rank>.svg`
- Back: `/games/cards/<variant>/back/<back>.svg` (`back` is `dark` or `light`)

Example: `/games/cards/minimal/heart/ace.svg`, `/games/cards/minimal/back/dark.svg`.

## Code

Path helpers and types: `src/domain/games/playing-cards.ts`.

```ts
import {
  playingCardFaceSrc,
  playingCardBackSrc,
} from "@/domain/games"

playingCardFaceSrc({ suit: "heart", rank: "ace" })
// → /games/cards/minimal/heart/ace.svg

playingCardBackSrc({ back: "dark" })
// → /games/cards/minimal/back/dark.svg
```

Override `variant` when adding a new deck folder.

## Adding a new variant

1. Copy `minimal/` to a new kebab-case folder (e.g. `classic/`).
2. Keep the same subfolders (`back`, four suits) and rank filenames.
3. Extend `PlayingCardVariant` in `playing-cards.ts`.
4. Pass `variant: "classic"` from game settings or user preference.

## Games using cards

Registry entries with card gameplay: `solitaire`, `tongits`, `pusoy-dos`, `spades`, and others tagged `cards` in `docs/GAMES.md`.
