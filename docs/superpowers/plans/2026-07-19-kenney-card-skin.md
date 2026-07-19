# Kenney Card Skin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a selectable **Kenney** playing-card skin (PNG assets + metadata-driven URLs) alongside Minimal, without changing Solitaire gameplay.

**Architecture:** Copy Kenney PNGs into `public/games/cards/kenney/` using the existing suit/rank folder convention. Extend `playing-cards.ts` with a per-skin metadata registry (label, extensions, theme→back mapping) so face/back URL helpers no longer hard-code `.svg` or dual backs. Solitaire theme consumers pass site theme into the back helper; Kenney always resolves to `back/default.png`. The picker lists Kenney automatically via `PLAYING_CARD_VARIANTS`.

**Tech Stack:** TypeScript, Vitest, Next.js static `public/` assets, existing Solitaire `PlayingCard` + `CardSkinPicker`.

## Global Constraints

- Skin id is exactly `kenney`; display label is exactly `Kenney`.
- Source directory is copied, never moved or edited in place: `E:\Assets\Kenney Game Assets All-in-1 3.5.0\2D assets\Playing Cards Pack\PNG\Cards (large)`.
- Keep original PNGs; no SVG/WebP conversion and no crop/preprocess at import.
- Import all pack files: 52 faces, 1 back, 2 jokers, 1 empty, plus license.
- Default skin remains `minimal`.
- Jokers and empty are imported but unused by Solitaire in this change.
- Existing Minimal SVG deck and dual backs stay unchanged on disk.
- Face rendering continues to use `object-fit: cover` (no renderer crop change).

---

## File map

| Path | Responsibility |
|------|----------------|
| `apps/web/public/games/cards/kenney/**` | Renamed Kenney PNG deck + `LICENSE.txt` |
| `packages/domain/games/playing-cards.ts` | Variant union, skin metadata, URL helpers |
| `packages/domain/games/playing-cards.test.ts` | Domain tests for registry + URLs |
| `apps/web/src/features/games/solitaire/components/playing-card.tsx` | Pass site theme into back helper |
| `apps/web/src/features/games/solitaire/components/klondike-board.tsx` | Theme → back resolution via new API |
| `apps/web/src/features/games/solitaire/components/klondike-drag-overlay.tsx` | Same |
| `apps/web/src/features/games/solitaire/components/klondike-fly-overlay.tsx` | Same |
| `docs/CARD-ASSETS.md` | Multi-format / Kenney documentation |

`CardSkinPicker` and preference helpers need no code changes once `PLAYING_CARD_VARIANTS` includes `kenney` and `formatPlayingCardVariantLabel` uses metadata.

---

### Task 1: Import and rename Kenney assets

**Files:**
- Create: `apps/web/public/games/cards/kenney/back/default.png`
- Create: `apps/web/public/games/cards/kenney/{club,diamond,heart,spade}/{ace…king}.png` (52 files)
- Create: `apps/web/public/games/cards/kenney/joker/black.png`
- Create: `apps/web/public/games/cards/kenney/joker/red.png`
- Create: `apps/web/public/games/cards/kenney/extra/empty.png`
- Create: `apps/web/public/games/cards/kenney/LICENSE.txt`

**Interfaces:**
- Consumes: Source PNGs and pack `License.txt` from the Kenney path above
- Produces: Project-relative paths matching `/games/cards/kenney/<suit>/<rank>.png` and `/games/cards/kenney/back/default.png`

- [ ] **Step 1: Run the import script (PowerShell)**

From repo root:

```powershell
$src = 'E:\Assets\Kenney Game Assets All-in-1 3.5.0\2D assets\Playing Cards Pack\PNG\Cards (large)'
$dst = 'apps\web\public\games\cards\kenney'
$licenseSrc = 'E:\Assets\Kenney Game Assets All-in-1 3.5.0\2D assets\Playing Cards Pack\License.txt'

$suitMap = @{
  clubs = 'club'
  diamonds = 'diamond'
  hearts = 'heart'
  spades = 'spade'
}
$rankMap = @{
  A = 'ace'; '02' = 'two'; '03' = 'three'; '04' = 'four'; '05' = 'five'
  '06' = 'six'; '07' = 'seven'; '08' = 'eight'; '09' = 'nine'; '10' = 'ten'
  J = 'jack'; Q = 'queen'; K = 'king'
}

New-Item -ItemType Directory -Force -Path @(
  "$dst\back", "$dst\club", "$dst\diamond", "$dst\heart", "$dst\spade",
  "$dst\joker", "$dst\extra"
) | Out-Null

Copy-Item -LiteralPath (Join-Path $src 'card_back.png') -Destination (Join-Path $dst 'back\default.png') -Force
Copy-Item -LiteralPath (Join-Path $src 'card_joker_black.png') -Destination (Join-Path $dst 'joker\black.png') -Force
Copy-Item -LiteralPath (Join-Path $src 'card_joker_red.png') -Destination (Join-Path $dst 'joker\red.png') -Force
Copy-Item -LiteralPath (Join-Path $src 'card_empty.png') -Destination (Join-Path $dst 'extra\empty.png') -Force
Copy-Item -LiteralPath $licenseSrc -Destination (Join-Path $dst 'LICENSE.txt') -Force

Get-ChildItem -LiteralPath $src -Filter 'card_*_*.png' | ForEach-Object {
  if ($_.Name -notmatch '^card_(clubs|diamonds|hearts|spades)_(.+)\.png$') { return }
  $suit = $suitMap[$Matches[1]]
  $rank = $rankMap[$Matches[2]]
  if (-not $suit -or -not $rank) { throw "Unmapped file: $($_.Name)" }
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $dst "$suit\$rank.png") -Force
}

Write-Output "faces=$((Get-ChildItem $dst -Recurse -Filter '*.png' | Where-Object { $_.Directory.Name -in 'club','diamond','heart','spade' }).Count)"
Write-Output "back=$((Test-Path "$dst\back\default.png"))"
Write-Output "jokers=$((Test-Path "$dst\joker\black.png") -and (Test-Path "$dst\joker\red.png"))"
Write-Output "empty=$((Test-Path "$dst\extra\empty.png"))"
Write-Output "license=$((Test-Path "$dst\LICENSE.txt"))"
```

Expected output:

```text
faces=52
back=True
jokers=True
empty=True
license=True
```

- [ ] **Step 2: Spot-check one face and the back**

Confirm these files exist and are non-empty PNGs:

- `apps/web/public/games/cards/kenney/club/ace.png`
- `apps/web/public/games/cards/kenney/spade/king.png`
- `apps/web/public/games/cards/kenney/back/default.png`

- [ ] **Step 3: Commit**

```bash
git add apps/web/public/games/cards/kenney
git commit -m "assets(cards): import Kenney PNG deck"
```

---

### Task 2: Skin metadata registry + URL helpers (TDD)

**Files:**
- Create: `packages/domain/games/playing-cards.test.ts`
- Modify: `packages/domain/games/playing-cards.ts`

**Interfaces:**
- Consumes: Existing suit/rank types; assets from Task 1 (path convention only)
- Produces:
  - `PlayingCardVariant = "minimal" | "kenney"`
  - `PLAYING_CARD_VARIANTS: readonly PlayingCardVariant[]`
  - `PlayingCardSkinDefinition` with `id`, `label`, `faceExtension`, `backExtension`, `backByTheme: { light: string; dark: string }`
  - `PLAYING_CARD_SKINS: Record<PlayingCardVariant, PlayingCardSkinDefinition>`
  - `getPlayingCardSkin(variant: PlayingCardVariant): PlayingCardSkinDefinition`
  - `formatPlayingCardVariantLabel(variant)` reads `label` from metadata
  - `playingCardFaceSrc({ variant?, suit, rank })` uses skin face extension
  - `playingCardBackSrc({ variant?, theme: "light" | "dark" })` uses `backByTheme[theme]` + back extension
  - Keep `PlayingCardBackVariant = "dark" | "light"` only if still needed elsewhere; prefer site-theme parameter on the back helper

- [ ] **Step 1: Write the failing tests**

Create `packages/domain/games/playing-cards.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  formatPlayingCardVariantLabel,
  isPlayingCardVariant,
  playingCardBackSrc,
  playingCardFaceSrc,
  PLAYING_CARD_VARIANTS,
} from "./playing-cards"

describe("playing-cards", () => {
  it("includes kenney in the variants list", () => {
    expect(PLAYING_CARD_VARIANTS).toEqual(["minimal", "kenney"])
  })

  it("accepts kenney and rejects unknown variants", () => {
    expect(isPlayingCardVariant("kenney")).toBe(true)
    expect(isPlayingCardVariant("classic")).toBe(false)
  })

  it("labels kenney as Kenney", () => {
    expect(formatPlayingCardVariantLabel("kenney")).toBe("Kenney")
  })

  it("keeps minimal SVG face and theme-contrast backs", () => {
    expect(
      playingCardFaceSrc({ suit: "heart", rank: "ace" }),
    ).toBe("/games/cards/minimal/heart/ace.svg")
    expect(playingCardBackSrc({ theme: "dark" })).toBe(
      "/games/cards/minimal/back/light.svg",
    )
    expect(playingCardBackSrc({ theme: "light" })).toBe(
      "/games/cards/minimal/back/dark.svg",
    )
  })

  it("resolves kenney PNG faces and a shared default back for both themes", () => {
    expect(
      playingCardFaceSrc({
        variant: "kenney",
        suit: "club",
        rank: "ace",
      }),
    ).toBe("/games/cards/kenney/club/ace.png")
    expect(playingCardBackSrc({ variant: "kenney", theme: "dark" })).toBe(
      "/games/cards/kenney/back/default.png",
    )
    expect(playingCardBackSrc({ variant: "kenney", theme: "light" })).toBe(
      "/games/cards/kenney/back/default.png",
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -w @pasttime/domain -- games/playing-cards.test.ts
```

Expected: FAIL (missing `kenney` / new `theme` API / wrong extensions).

- [ ] **Step 3: Implement metadata + helpers**

Replace the hard-coded URL helpers in `packages/domain/games/playing-cards.ts` with this shape (keep existing suit/rank exports):

```ts
export type PlayingCardVariant = "minimal" | "kenney"

export const DEFAULT_PLAYING_CARD_VARIANT: PlayingCardVariant = "minimal"

export const PLAYING_CARD_VARIANTS: readonly PlayingCardVariant[] = [
  "minimal",
  "kenney",
] as const

export type PlayingCardSiteTheme = "light" | "dark"

export type PlayingCardSkinDefinition = {
  id: PlayingCardVariant
  label: string
  faceExtension: "svg" | "png"
  backExtension: "svg" | "png"
  /** Filename stem under `back/` for each site theme. */
  backByTheme: Record<PlayingCardSiteTheme, string>
}

export const PLAYING_CARD_SKINS: Record<
  PlayingCardVariant,
  PlayingCardSkinDefinition
> = {
  minimal: {
    id: "minimal",
    label: "Minimal",
    faceExtension: "svg",
    backExtension: "svg",
    backByTheme: { light: "dark", dark: "light" },
  },
  kenney: {
    id: "kenney",
    label: "Kenney",
    faceExtension: "png",
    backExtension: "png",
    backByTheme: { light: "default", dark: "default" },
  },
}

export function getPlayingCardSkin(
  variant: PlayingCardVariant,
): PlayingCardSkinDefinition {
  return PLAYING_CARD_SKINS[variant]
}

export function formatPlayingCardVariantLabel(
  variant: PlayingCardVariant,
): string {
  return getPlayingCardSkin(variant).label
}

export interface PlayingCardFaceRef {
  variant?: PlayingCardVariant
  suit: PlayingCardSuit
  rank: PlayingCardRank
}

export interface PlayingCardBackRef {
  variant?: PlayingCardVariant
  /** Site color mode (not the back art name). */
  theme: PlayingCardSiteTheme
}

export function playingCardFaceSrc({
  variant = DEFAULT_PLAYING_CARD_VARIANT,
  suit,
  rank,
}: PlayingCardFaceRef): string {
  const skin = getPlayingCardSkin(variant)
  return `${CARDS_BASE}/${variant}/${suit}/${rank}.${skin.faceExtension}`
}

export function playingCardBackSrc({
  variant = DEFAULT_PLAYING_CARD_VARIANT,
  theme,
}: PlayingCardBackRef): string {
  const skin = getPlayingCardSkin(variant)
  const back = skin.backByTheme[theme]
  return `${CARDS_BASE}/${variant}/back/${back}.${skin.backExtension}`
}
```

Remove the old `PlayingCardBackVariant` / `PLAYING_CARD_BACK_VARIANTS` exports **only after** Task 3 updates all Solitaire call sites. In this task, if typecheck would fail mid-plan, keep a temporary deprecated alias:

```ts
/** @deprecated Prefer PlayingCardSiteTheme with playingCardBackSrc({ theme }) */
export type PlayingCardBackVariant = PlayingCardSiteTheme
```

and delete it in Task 3 once callers are migrated.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -w @pasttime/domain -- games/playing-cards.test.ts
```

Expected: PASS (all 5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/domain/games/playing-cards.ts packages/domain/games/playing-cards.test.ts
git commit -m "feat(cards): add Kenney skin metadata and URL helpers"
```

---

### Task 3: Wire Solitaire theme → back helper

**Files:**
- Modify: `apps/web/src/features/games/solitaire/components/playing-card.tsx`
- Modify: `apps/web/src/features/games/solitaire/components/klondike-board.tsx`
- Modify: `apps/web/src/features/games/solitaire/components/klondike-drag-overlay.tsx`
- Modify: `apps/web/src/features/games/solitaire/components/klondike-fly-overlay.tsx`

**Interfaces:**
- Consumes: `playingCardBackSrc({ variant, theme })`, `PlayingCardSiteTheme`
- Produces: Face-down Kenney cards load `/games/cards/kenney/back/default.png` in both themes; Minimal contrast backs unchanged

- [ ] **Step 1: Update `PlayingCard` props**

In `playing-card.tsx`:

- Import `PlayingCardSiteTheme` instead of `PlayingCardBackVariant`.
- Rename prop `backVariant` → `theme` (type `PlayingCardSiteTheme`, default `"light"`).
- Face-down branch:

```ts
playingCardBackSrc({ variant, theme })
```

- [ ] **Step 2: Update board and overlays**

Replace every:

```ts
const backVariant = resolvedTheme === "dark" ? "light" : "dark"
```

with passing the site theme through:

```ts
const theme = resolvedTheme === "dark" ? "dark" : "light"
```

And every `backVariant={backVariant}` with `theme={theme}`.

In `klondike-fly-overlay.tsx`, rename the prop type from `"light" | "dark"` back-contrast naming to site theme, and stop inverting before `PlayingCard`.

- [ ] **Step 3: Remove deprecated back-variant exports if still present**

In `playing-cards.ts`, delete `PlayingCardBackVariant` / `PLAYING_CARD_BACK_VARIANTS` if Task 2 left a temporary alias. Grep the repo for `PlayingCardBackVariant` and `PLAYING_CARD_BACK_VARIANTS` — zero remaining references.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck -w @pasttime/domain
npm run typecheck -w @pasttime/web
```

Expected: clean.

- [ ] **Step 5: Manual smoke (dev server already running)**

1. Open Solitaire play settings → Card skin → select **Kenney** → Apply.
2. Confirm face-up cards show Kenney PNGs filling the portrait slot.
3. Confirm face-down stock/tableau show the blue Kenney back.
4. Toggle site theme light/dark — Kenney back stays the same; Minimal still swaps contrast backs.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/games/solitaire/components/playing-card.tsx \
  apps/web/src/features/games/solitaire/components/klondike-board.tsx \
  apps/web/src/features/games/solitaire/components/klondike-drag-overlay.tsx \
  apps/web/src/features/games/solitaire/components/klondike-fly-overlay.tsx \
  packages/domain/games/playing-cards.ts
git commit -m "feat(solitaire): resolve card backs from site theme metadata"
```

---

### Task 4: Update CARD-ASSETS docs

**Files:**
- Modify: `docs/CARD-ASSETS.md`

**Interfaces:**
- Consumes: Final metadata API from Task 2
- Produces: Accurate docs for multi-format skins and Kenney layout

- [ ] **Step 1: Rewrite `docs/CARD-ASSETS.md`**

Replace stale `src/domain` / `.svg`-only guidance with content that includes:

1. Directory layout for both `minimal` (SVG + `dark`/`light` backs) and `kenney` (PNG + `default` back + optional `joker/` / `extra/`).
2. Public URL pattern using the skin’s extension: `/games/cards/<variant>/<suit>/<rank>.<ext>`.
3. Import path `@pasttime/domain/games` (not `@/domain/games`).
4. Example:

```ts
import {
  playingCardFaceSrc,
  playingCardBackSrc,
} from "@pasttime/domain/games"

playingCardFaceSrc({ variant: "kenney", suit: "heart", rank: "ace" })
// → /games/cards/kenney/heart/ace.png

playingCardBackSrc({ variant: "kenney", theme: "dark" })
// → /games/cards/kenney/back/default.png
```

5. Adding a variant: add folder + extend `PLAYING_CARD_SKINS` / `PlayingCardVariant` / `PLAYING_CARD_VARIANTS`.
6. Kenney license note: CC0; credit Kenney / kenney.nl optional; see `public/games/cards/kenney/LICENSE.txt`.

- [ ] **Step 2: Commit**

```bash
git add docs/CARD-ASSETS.md
git commit -m "docs(cards): document Kenney multi-format skin layout"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Copy + rename all Kenney assets incl. jokers/empty/license | Task 1 |
| Metadata registry (label, extensions, theme→back) | Task 2 |
| PNG faces + shared default back | Task 2 |
| Extend variant + picker auto-lists Kenney | Task 2 (`PLAYING_CARD_VARIANTS`) |
| Solitaire theme wiring / cover fill unchanged | Task 3 |
| Docs update | Task 4 |
| Domain URL + variant tests | Task 2 |
| Manual Solitaire verification | Task 3 Step 5 |

Out of scope left out intentionally: Minimal art changes, back picker UI, joker gameplay, other card games, PNG preprocessing.
