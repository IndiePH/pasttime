# Standard Game Launch Actions & Universal Daily-Completed Hook

**Date:** 2026-06-30
**Status:** Draft
**Scope:** Shared components + crossword landing page refactor

---

## 1. Overview

Standardize the landing page button section across all games using a shared `GameLaunchActions` component. Introduce a universal `useDailyCompleted` hook for daily-puzzle completion detection that works for any game without per-game predicates.

### What changes

| Game | Change |
|------|--------|
| **Crossword** | Remove `CrosswordModePicker`, wire `CrosswordSettingsWidget`, use `GameLaunchActions` + `useDailyCompleted` |
| **Word Guess** | Add top-level `status` to stored state shape, replace `useWordGuessDailyCompleted` with universal hook, use `GameLaunchActions` |
| **Solitaire** | Replace `SolitaireLaunchActions` with `GameLaunchActions` (no daily hook) |
| **Shared** | New `GameLaunchActions` component, new `useDailyCompleted` hook, refactor `GameHowToPlay` placement |

---

## 2. Universal `useDailyCompleted` Hook

### Location
`apps/web/src/features/games/hooks/use-daily-completed.ts`

### API

```ts
function useDailyCompleted(gameId: string, variant: string): boolean
```

- `gameId` — e.g. `"crossword"`, `"word-guess"`
- `variant` — e.g. `"7"` (grid size), `"5"` (word length)

### Behavior

- Constructs storage key: `{gameId}:daily:{variant}:{getDailySeed()}`
- Reads stored state, returns `true` if `status === "won"` or `status === "lost"` (daily round is finished)
- Re-checks on `focus` and `visibilitychange` events
- Handles missing/corrupt storage gracefully (returns `false`)

### Contract

Every game's stored daily state MUST have a top-level `status` field with values `"playing" | "won" | "lost" | "abandoned"` (matching the existing `CrosswordGameState` convention).

### Games affected

| Game | Stored shape | Needs refactor? |
|------|-------------|-----------------|
| Crossword | `{ ..., status: "won" \| "playing" \| "lost" \| "abandoned" }` | No — already conforms |
| Word Guess | `{ round: { ..., status }, currentGuess }` | Yes — add `status` at top level |
| Solitaire | No daily mechanic | N/A |

### Word guess storage migration

In `packages/domain/games/word-guess/persistence.ts`:

- `StoredWordGuessGame` currently: `{ round: WordGuessRoundState, currentGuess: string }`
- Add `status: WordGuessRoundState["status"]` at top level
- On write: mirror `.round.status`
- On read: top-level `status` is authoritative (round.status kept for backwards compat)
- Old saved games from previous daily seeds are naturally discarded when seed changes

---

## 3. Shared `GameLaunchActions` Component

### Location
`apps/web/src/features/games/components/game-launch-actions.tsx`

### Props

```ts
interface GameLaunchActionsProps {
  game: GameDefinition
  /** Href for the primary play action (required) */
  playHref: string
  /** Override the auto-derived play button label */
  playLabel?: string
  /** Whether daily puzzle is completed — when provided, playLabel is derived */
  dailyCompleted?: boolean
  /** Optional secondary action link (e.g. "View today's results") */
  secondaryAction?: {
    label: string
    href: string
  }
  /** Multiplayer: create room handler */
  onCreateRoom?: () => void
  /** Multiplayer: join room handler */
  onJoinRoom?: () => void
}
```

### Rendering logic

```
+---------------------------+
| [ How to Play ]           |  ← GameHowToPlay, always present
| [ Primary Play Button ]   |  ← full-width, default variant
| (optional secondary action) |
| [ View today's results ]  |  ← full-width, secondary variant, only if secondaryAction
| (conditional multiplayer) |
| [ Create room ]           |  ← full-width, secondary variant, only if onCreateRoom
| [ Join room ]             |  ← full-width, outline variant, only if onJoinRoom
+---------------------------+
| [ Back to catalog ]       |  ← outline, below section
+---------------------------+
```

### Play button label derivation

```
if dailyCompleted is provided AND dailyCompleted === true → "Play puzzle"
if dailyCompleted is provided AND dailyCompleted === false → "Play daily puzzle"
if playLabel is provided → use playLabel
otherwise → "Play"
```

### Back to catalog

- Label: `"Back to catalog"`
- Href: `/`
- Variant: `outline`
- Renders below the main action group with `mt-6`

### Multiplayer panel state

When `onJoinRoom` is provided, the component manages its own `showJoinPanel` state internally. When the panel is open, the buttons are replaced with the `JoinRoomPanel` component (already shared, existing) passed the room creation and cancel handlers.

---

## 4. Crossword Landing Page Refactor

### New structure

```tsx
// crossword-launch-view.tsx
export function CrosswordLaunchView({ game }: CrosswordLaunchViewProps) {
  const [size] = useQueryState("size", crosswordSearchParams.size)
  const resolvedSize = size ?? 7
  const isDailyCompleted = useDailyCompleted("crossword", String(resolvedSize))

  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <CrosswordSettingsWidget className="mt-6" />
      <GameLaunchActions
        game={game}
        playHref={crosswordPlayPath(resolvedSize, isDailyCompleted ? "random" : "daily")}
        dailyCompleted={isDailyCompleted}
      />
    </GamePageShell>
  )
}
```

### What's removed

- `CrosswordModePicker` component entirely (mode pills, inline size chips, inline buttons)
- Ad-hoc button rendering from crossword launch view

### What's fixed

- `CrosswordSettingsWidget`: remove `5` from the size chip list — GRID_SIZES already removed 5×5

### Edge cases

| Case | Behavior |
|------|----------|
| First visit, no stored state | `useDailyCompleted` returns `false` → "Play daily puzzle" → daily mode |
| Daily puzzle in progress | `status === "playing"` → `false` → "Play daily puzzle" (resumes existing session) |
| Daily puzzle completed | `status === "won"` or `"lost"` → "Play puzzle" → random mode |
| Daily rolled over | New daily seed → different storage key → `false` → "Play daily puzzle" |
| Storage corrupt/missing | Returns `false` → "Play daily puzzle" |

---

## 5. Word Guess Refactor

### Storage

Add `status` to `StoredWordGuessGame`:

```ts
interface StoredWordGuessGame {
  round: WordGuessRoundState
  currentGuess: string
  status: WordGuessRoundState["status"]  // NEW — mirrors round.status
}
```

### Launch actions

Replace `WordGuessLaunchActions` with `GameLaunchActions`:

```tsx
// word-guess-launch-view.tsx
const wordLength = Number(lettersParam) as WordGuessLength
const isDailyCompleted = useDailyCompleted("word-guess", String(wordLength))
const router = usePlatformRouter()

function handleCreateRoom() {
  router.push(wordGuessRoomPath(generateRoomCode(), wordLength, mode))
}

return (
  <GamePageShell>
    <GameSessionHeader game={game} subtitle={game.description} />
    <WordGuessSettingsWidget className="mt-6" />
    <GameLaunchActions
      game={game}
      playHref={wordGuessPlayPath(wordLength, isDailyCompleted ? "random" : "daily")}
      dailyCompleted={isDailyCompleted}
      secondaryAction={{
        label: "View today's results",
        href: wordGuessPlayPath(wordLength, "daily"),
      }}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={() => setShowJoinPanel(true)}
    />
  </GamePageShell>
)
```

**Note:** The "View today's results" button is passed via the `secondaryAction` prop, which `GameLaunchActions` renders between the play button and any room controls.

---

## 6. Solitaire Refactor

Replace `SolitaireLaunchActions` with `GameLaunchActions`:

```tsx
// solitaire-launch-view.tsx
<GameLaunchActions
  game={game}
  playHref={solitairePlayPath(mode)}
  playLabel="Play"
/>
```

No changes to solitaire beyond the button component swap.

---

## 7. Files Changed

### New files
| File | Purpose |
|------|---------|
| `apps/web/src/features/games/hooks/use-daily-completed.ts` | Universal daily-completed hook |
| `apps/web/src/features/games/components/game-launch-actions.tsx` | Shared launch actions component |

### Modified files
| File | Change |
|------|--------|
| `apps/web/src/features/games/crossword/components/crossword-launch-view.tsx` | Use `GameLaunchActions`, `CrosswordSettingsWidget`, `useDailyCompleted` |
| `apps/web/src/features/games/crossword/components/crossword-settings-widget.tsx` | Remove 5×5 option |
| `apps/web/src/features/games/word-guess/components/word-guess-launch-view.tsx` | Use `GameLaunchActions`, `useDailyCompleted` |
| `apps/web/src/features/games/word-guess/components/word-guess-launch-actions.tsx` | Remove — replaced by `GameLaunchActions` |
| `apps/web/src/features/games/solitaire/components/solitaire-launch-view.tsx` | Use `GameLaunchActions` |
| `apps/web/src/features/games/solitaire/components/solitaire-launch-actions.tsx` | Remove — replaced by `GameLaunchActions` |
| `packages/domain/games/word-guess/persistence.ts` | Add top-level `status` to `StoredWordGuessGame` |
| `apps/web/src/features/games/crossword/components/crossword-mode-picker.tsx` | Remove entirely |
| `apps/web/src/features/games/components/index.ts` | Export `GameLaunchActions` |

### Deleted files
| File | Reason |
|------|--------|
| `apps/web/src/features/games/crossword/components/crossword-mode-picker.tsx` | Replaced by `CrosswordSettingsWidget` + `GameLaunchActions` |
| `apps/web/src/features/games/word-guess/components/word-guess-launch-actions.tsx` | Replaced by `GameLaunchActions` |
| `apps/web/src/features/games/solitaire/components/solitaire-launch-actions.tsx` | Replaced by `GameLaunchActions` |

---

## 8. Testing

| Test area | What to cover |
|-----------|---------------|
| `useDailyCompleted` | Returns false when no stored state, true when status is "won" or "lost", false for "playing"/"abandoned", refreshes on focus/visibility |
| `GameLaunchActions` | Renders correct buttons with/without roomControls, dailyCompleted toggles label, "Back to catalog" always present |
| Crossword launch view | Mode pills removed, settings wired, play button label reflects daily status |
| Word guess launch view | Room controls still work, daily completion check works with new storage format |
| CrosswordSettingsWidget | 5×5 no longer appears |

---

## 9. Implementation Order

1. `useDailyCompleted` hook + domain exports
2. Word guess storage migration (add `status`)
3. `GameLaunchActions` component
4. Crossword launch view refactor
5. Word guess launch view refactor
6. Solitaire launch view refactor
7. Clean up deleted files and index exports
