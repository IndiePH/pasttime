# Kenney Card Skin Design

**Date:** 2026-07-19  
**Status:** Approved for planning

## Goal

Add a second playing-card skin named **Kenney**, sourced from Kenney’s Playing Cards Pack (large PNG tiles). Copy and rename assets into the project’s existing deck layout, extend the skin system so PNG decks and a single shared back work alongside the current SVG Minimal skin, and expose Kenney in the Solitaire card-skin picker.

## Decisions

| Topic | Decision |
|-------|----------|
| Skin id / label | `kenney` / **Kenney** |
| Source | `E:\Assets\Kenney Game Assets All-in-1 3.5.0\2D assets\Playing Cards Pack\PNG\Cards (large)` |
| Import scope | All pack files: 52 faces, 1 back, 2 jokers, 1 empty, plus license |
| Format | Keep original PNGs (no SVG/WebP conversion) |
| Integration | Skin **metadata registry** (label, face/back extension, theme→back mapping) |
| Card fit | Existing renderer `object-fit: cover` fills the portrait slot |
| Default skin | Remains `minimal` |
| Jokers / empty | Imported for completeness; unused by Solitaire in this change |

## Architecture

### Metadata registry

Replace hard-coded `.svg` URLs and assumed dual backs with per-skin metadata:

- `id`, display `label`
- Face and back file extensions (Minimal: `svg`; Kenney: `png`)
- Theme → back filename mapping  
  - Minimal: site dark → `light`, site light → `dark` (unchanged)  
  - Kenney: both themes → `default`

URL helpers (`playingCardFaceSrc`, `playingCardBackSrc`) read metadata instead of assuming one format.

### Asset layout

```text
apps/web/public/games/cards/kenney/
├── back/default.png
├── club|diamond|heart|spade/
│   └── ace.png … king.png   (13 each)
├── joker/black.png
├── joker/red.png
├── extra/empty.png
└── LICENSE.txt
```

### Rename map

| Source | Destination |
|--------|-------------|
| `card_clubs_A.png` … `K` | `club/ace.png` … `king.png` |
| `card_diamonds_*` | `diamond/...` |
| `card_hearts_*` | `heart/...` |
| `card_spades_*` | `spade/...` |
| `card_back.png` | `back/default.png` |
| `card_joker_black.png` / `card_joker_red.png` | `joker/black.png` / `joker/red.png` |
| `card_empty.png` | `extra/empty.png` |
| Pack `License.txt` | `LICENSE.txt` |

Ranks: `A→ace`, `02…10→two…ten`, `J/Q/K→jack/queen/king`. Suits: plural → singular.

Source assets are **copied**, never moved or edited in place.

### Runtime wiring

- Extend `PlayingCardVariant` with `"kenney"` and add to `PLAYING_CARD_VARIANTS`.
- `CardSkinPicker` lists Kenney automatically via the variants array.
- Solitaire keeps the global preference key `games:cards:variant`; invalid values still fall back to `minimal`.
- Face-down cards use Kenney `back/default.png` in both site themes.
- Faces use the existing cover treatment so the 64×64 transparent tile fills the portrait card slot.

### Documentation

Update `docs/CARD-ASSETS.md` for:

- Multi-format skins
- Metadata-driven URL helpers
- Kenney directory layout and license note (CC0; credit optional)

## Out of scope

- Changing Minimal artwork
- User-selectable card backs beyond theme mapping
- Joker gameplay or empty-card UI
- Tongits / Pusoy Dos / Spades play integration
- Cropping or preprocessing PNGs at import time

## Testing

- Domain: Kenney face/back URLs resolve with `.png` and `back/default`.
- Domain: `isPlayingCardVariant` accepts `kenney`; unknown stored values still reject/fall back.
- Manual: Solitaire settings can select Kenney; faces and backs render under cover fill on light and dark themes.
- Import check: 52 faces + `back/default.png` present for runtime; jokers/empty present on disk but unused.

## License

Kenney Playing Cards Pack — Creative Commons Zero (CC0). Free for commercial use; crediting Kenney / kenney.nl is appreciated but not required. Ship `LICENSE.txt` beside the Kenney assets.
