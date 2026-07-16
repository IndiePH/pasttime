# Standard Game Launch Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize landing page buttons across all games with a shared `GameLaunchActions` component and universal `useDailyCompleted` hook.

**Architecture:** A new universal hook checks daily completion via storage key `{gameId}:daily:{variant}:{dailySeed}`. A new shared component renders the standard button set (How to Play → Play → optional secondary/multiplayer buttons → Back to catalog). Each game's launch view swaps its custom actions for the shared component.

**Tech Stack:** React 19, TypeScript, Vitest, nuqs, shadcn Button, lucide-react

## Global Constraints

- All new files follow existing project conventions (CVA-style exports, `cn()` utility, Radix `Slot` via `asChild`)
- Daily storage key format: `{gameId}:daily:{variant}:{dailySeed}` — matches word guess pattern
- `useDailyCompleted` returns `true` when stored state has `status === "won"` or `status === "lost"`
- Play button label: daily not completed → "Play daily puzzle", daily completed → "Play puzzle", fallback/no daily → "Play"
- "Back to catalog" label always rendered, links to `/`, variant `outline`
- Back button in play view stays "Back to setup" (not part of this refactor)

---

### Task 1: `useDailyCompleted` hook + tests

**Files:**
- Create: `apps/web/src/features/games/hooks/use-daily-completed.ts`
- Create: `apps/web/src/features/games/hooks/use-daily-completed.test.ts`

**Interfaces:**
- Consumes: `useStorage` from `@/infrastructure/storage`, `getDailySeed` from `@pasttime/domain/daily`
- Produces: `useDailyCompleted(gameId: string, variant: string): boolean`

- [ ] **Step 1: Write the hook**

`apps/web/src/features/games/hooks/use-daily-completed.ts`:

```ts
"use client"

import { useEffect, useReducer } from "react"
import { getDailySeed } from "@pasttime/domain/daily"
import { useStorage } from "@/infrastructure/storage"

function getStatus(stored: unknown): string | null {
  if (!stored || typeof stored !== "object") return null
  const record = stored as Record<string, unknown>
  const status = record.status
  return typeof status === "string" ? status : null
}

export function useDailyCompleted(
  gameId: string,
  variant: string,
): boolean {
  const storage = useStorage()
  const [, refresh] = useReducer((c) => c + 1, 0)

  const key = `${gameId}:daily:${variant}:${getDailySeed(new Date())}`

  // Refresh on focus/visibility changes (player may complete daily in another tab)
  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener("focus", handler)
    document.addEventListener("visibilitychange", handler)
    return () => {
      window.removeEventListener("focus", handler)
      document.removeEventListener("visibilitychange", handler)
    }
  }, [])

  const status = getStatus(storage.get(key))
  return status === "won" || status === "lost"
}
```

- [ ] **Step 2: Write the test file**

`apps/web/src/features/games/hooks/use-daily-completed.test.ts`:

```ts
import { renderHook, act } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { useDailyCompleted } from "./use-daily-completed"
import { useStorage } from "@/infrastructure/storage"
import { getDailySeed } from "@pasttime/domain/daily"

vi.mock("@/infrastructure/storage", () => ({
  useStorage: vi.fn(),
}))

const todayKey = `crossword:7:${getDailySeed(new Date())}`

describe("useDailyCompleted", () => {
  const mockGet = vi.fn()

  beforeEach(() => {
    vi.mocked(useStorage).mockReturnValue({ get: mockGet } as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns false when no stored state exists", () => {
    mockGet.mockReturnValue(null)
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)
  })

  it("returns false when stored state is corrupt", () => {
    mockGet.mockReturnValue({ notStatus: "won" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)
  })

  it("returns true when status is won", () => {
    mockGet.mockReturnValue({ status: "won" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(true)
  })

  it("returns true when status is lost", () => {
    mockGet.mockReturnValue({ status: "lost" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(true)
  })

  it("returns false when status is playing", () => {
    mockGet.mockReturnValue({ status: "playing" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)
  })

  it("returns false when status is abandoned", () => {
    mockGet.mockReturnValue({ status: "abandoned" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)
  })

  it("uses correct storage key", () => {
    mockGet.mockReturnValue(null)
    renderHook(() => useDailyCompleted("crossword", "7"))
    expect(mockGet).toHaveBeenCalledWith(todayKey)
  })

  it("refreshes on focus event", () => {
    mockGet.mockReturnValue({ status: "playing" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)

    mockGet.mockReturnValue({ status: "won" })
    act(() => {
      window.dispatchEvent(new Event("focus"))
    })
    expect(result.current).toBe(true)
  })

  it("refreshes on visibilitychange event", () => {
    mockGet.mockReturnValue({ status: "playing" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)

    mockGet.mockReturnValue({ status: "won" })
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"))
    })
    expect(result.current).toBe(true)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
cd apps/web && npx vitest run src/features/games/hooks/use-daily-completed.test.ts --reporter=verbose
```

Expected: All 9 tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/games/hooks/use-daily-completed.ts apps/web/src/features/games/hooks/use-daily-completed.test.ts
git commit -m "feat: add universal useDailyCompleted hook"
```

---

### Task 2: Word guess storage migration — add top-level `status`

**Files:**
- Modify: `packages/domain/games/word-guess/persistence.ts`

**Interfaces:**
- Consumes: Existing `StoredWordGuessGame` shape
- Produces: `StoredWordGuessGame` with top-level `status` field

- [ ] **Step 1: Find the write path**

First, find where `StoredWordGuessGame` is written to storage to know where to add the `status` mirror:

```bash
grep -rn "StoredWordGuessGame\|parseStoredWordGuessGame\|storage.set" apps/web/src/features/games/word-guess/
```

Expected: Finds the hook file that writes game state to storage (likely `use-word-guess-game.ts` or similar).

- [ ] **Step 2: Add `status` to the stored type**

In `packages/domain/games/word-guess/persistence.ts`, update the interface:

```ts
export interface StoredWordGuessGame {
  round: WordGuessRoundState
  currentGuess: string
  /** Mirrors round.status for universal useDailyCompleted hook. */
  status: WordGuessRoundState["status"]
}
```

- [ ] **Step 3: Add `status` at the write point**

In the file found in Step 1, when writing the stored game, include `status` at the top level:

```ts
storage.set(storageKey, {
  round,
  currentGuess,
  status: round.status,  // mirror for useDailyCompleted
})
```

- [ ] **Step 4: Run existing tests to verify nothing broke**

```bash
cd apps/web && npx vitest run src/features/games/word-guess/ --reporter=verbose
```

Expected: All existing word-guess tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/domain/games/word-guess/persistence.ts apps/web/src/features/games/word-guess/
git commit -m "feat: add top-level status to word guess stored state"
```

---

### Task 3: `GameLaunchActions` component + tests

**Files:**
- Create: `apps/web/src/features/games/components/game-launch-actions.tsx`
- Create: `apps/web/src/features/games/components/__tests__/game-launch-actions.test.tsx`

**Interfaces:**
- Consumes: `GameDefinition` from `@pasttime/domain/games`, `Button` from `@/components/ui/button`, `GameHowToPlay` from `@/features/games/components/game-how-to-play`, `PlatformLink` from `@/platform/navigation`, `JoinRoomPanel` from `@/features/games/components/join-room-panel`
- Produces: `GameLaunchActions` component

- [ ] **Step 1: Write the component**

`apps/web/src/features/games/components/game-launch-actions.tsx`:

```tsx
"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import type { GameDefinition } from "@pasttime/domain/games"
import { GameHowToPlay } from "@/features/games/components/game-how-to-play"
import { JoinRoomPanel } from "@/features/games/components/join-room-panel"
import { PlatformLink } from "@/platform/navigation"

interface GameLaunchActionsProps {
  game: GameDefinition
  /** Href for the primary play button. */
  playHref: string
  /** Override the auto-derived play button label. */
  playLabel?: string
  /** Whether the daily puzzle has been completed — derived label when provided. */
  dailyCompleted?: boolean
  /** Optional secondary action link (e.g. "View today's results"). */
  secondaryAction?: {
    label: string
    href: string
  }
  /** Multiplayer: create room handler. */
  onCreateRoom?: () => void
  /** Multiplayer: join room handler. */
  onJoinRoom?: () => void
}

export function GameLaunchActions({
  game,
  playHref,
  playLabel: playLabelProp,
  dailyCompleted,
  secondaryAction,
  onCreateRoom,
  onJoinRoom,
}: GameLaunchActionsProps) {
  const [showJoinPanel, setShowJoinPanel] = React.useState(false)

  // Derive play button label
  const playLabel = React.useMemo(() => {
    if (playLabelProp) return playLabelProp
    if (dailyCompleted !== undefined) {
      return dailyCompleted ? "Play puzzle" : "Play daily puzzle"
    }
    return "Play"
  }, [playLabelProp, dailyCompleted])

  // Room handlers with internal panel state
  const handleCreateRoom = React.useCallback(() => {
    onCreateRoom?.()
  }, [onCreateRoom])

  const handleJoinRoom = React.useCallback(() => {
    setShowJoinPanel(true)
    onJoinRoom?.()
  }, [onJoinRoom])

  const handleJoinCancel = React.useCallback(() => {
    setShowJoinPanel(false)
  }, [])

  // Render join room panel when active
  if (showJoinPanel) {
    return (
      <>
        <JoinRoomPanel
          gameId={game.id}
          roomHrefForCode={() => ""}
          onCancel={handleJoinCancel}
        />
        <Button variant="outline" className="mt-6 w-full max-w-xs self-center" asChild>
          <PlatformLink href="/">Back to catalog</PlatformLink>
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <GameHowToPlay game={game} />
        <Button type="button" className="w-full" asChild>
          <PlatformLink href={playHref}>{playLabel}</PlatformLink>
        </Button>
        {secondaryAction ? (
          <Button type="button" variant="secondary" className="w-full" asChild>
            <PlatformLink href={secondaryAction.href}>
              {secondaryAction.label}
            </PlatformLink>
          </Button>
        ) : null}
        {onCreateRoom ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleCreateRoom}
          >
            Create room
          </Button>
        ) : null}
        {onJoinRoom ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleJoinRoom}
          >
            Join room
          </Button>
        ) : null}
      </div>
      <Button variant="outline" className="mt-6" asChild>
        <PlatformLink href="/">Back to catalog</PlatformLink>
      </Button>
    </>
  )
}
```

- [ ] **Step 2: Write the test file**

`apps/web/src/features/games/components/__tests__/game-launch-actions.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { GameLaunchActions } from "../game-launch-actions"
import type { GameDefinition } from "@pasttime/domain/games"

vi.mock("@/features/games/components/game-how-to-play", () => ({
  GameHowToPlay: () => <div data-testid="how-to-play">How to Play</div>,
}))

vi.mock("@/platform/navigation", () => ({
  PlatformLink: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

const mockGame = { id: "crossword", title: "Crossword" } as GameDefinition

describe("GameLaunchActions", () => {
  it("renders How to Play, Play, and Back to catalog by default", () => {
    render(<GameLaunchActions game={mockGame} playHref="/play" />)
    expect(screen.getByTestId("how-to-play")).toBeInTheDocument()
    expect(screen.getByText("Play")).toBeInTheDocument()
    expect(screen.getByText("Back to catalog")).toBeInTheDocument()
  })

  it('renders "Play daily puzzle" when dailyCompleted is false', () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play?mode=daily"
        dailyCompleted={false}
      />,
    )
    expect(screen.getByText("Play daily puzzle")).toBeInTheDocument()
  })

  it('renders "Play puzzle" when dailyCompleted is true', () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play?mode=random"
        dailyCompleted={true}
      />,
    )
    expect(screen.getByText("Play puzzle")).toBeInTheDocument()
  })

  it("uses custom playLabel when provided", () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play"
        playLabel="Start game"
      />,
    )
    expect(screen.getByText("Start game")).toBeInTheDocument()
  })

  it("renders secondary action when provided", () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play"
        secondaryAction={{ label: "View results", href: "/results" }}
      />,
    )
    expect(screen.getByText("View results")).toBeInTheDocument()
  })

  it("renders room controls when handlers provided", () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play"
        onCreateRoom={vi.fn()}
        onJoinRoom={vi.fn()}
      />,
    )
    expect(screen.getByText("Create room")).toBeInTheDocument()
    expect(screen.getByText("Join room")).toBeInTheDocument()
  })

  it("play link goes to playHref", () => {
    render(<GameLaunchActions game={mockGame} playHref="/crossword/play" />)
    expect(screen.getByText("Play").closest("a")).toHaveAttribute(
      "href",
      "/crossword/play",
    )
  })

  it("back to catalog links to /", () => {
    render(<GameLaunchActions game={mockGame} playHref="/play" />)
    expect(screen.getByText("Back to catalog").closest("a")).toHaveAttribute(
      "href",
      "/",
    )
  })
})
```

- [ ] **Step 3: Run tests**

```bash
cd apps/web && npx vitest run src/features/games/components/__tests__/game-launch-actions.test.tsx --reporter=verbose
```

Expected: All 8 tests pass.

- [ ] **Step 4: Export from index**

Add to `apps/web/src/features/games/components/index.ts`:

```ts
export { GameLaunchActions } from "./game-launch-actions"
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/games/components/game-launch-actions.tsx apps/web/src/features/games/components/__tests__/ apps/web/src/features/games/components/index.ts
git commit -m "feat: add shared GameLaunchActions component"
```

---

### Task 4: Fix crossword settings widget — remove 5×5

**Files:**
- Modify: `apps/web/src/features/games/crossword/components/crossword-settings-widget.tsx`

- [ ] **Step 1: Remove `5` from size array**

In `crossword-settings-widget.tsx`, change:

```tsx
{[5, 7, 9, 11, 13, 15].map((s) => {
```

to:

```tsx
{[7, 9, 11, 13, 15].map((s) => {
```

Also update the draft state type and default if needed. The current draft default is `15` which is fine (it's overwritten by `handleOpen`).

- [ ] **Step 2: Run crossword tests**

```bash
cd apps/web && npx vitest run src/features/games/crossword/ --reporter=verbose
```

Expected: All crossword tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/games/crossword/components/crossword-settings-widget.tsx
git commit -m "fix: remove 5x5 from crossword settings grid size options"
```

---

### Task 5: Crossword launch view refactor

**Files:**
- Modify: `apps/web/src/features/games/crossword/components/crossword-launch-view.tsx`
- Delete: `apps/web/src/features/games/crossword/components/crossword-mode-picker.tsx`
- Modify: `apps/web/src/features/games/crossword/components/index.ts`

- [ ] **Step 1: Rewrite crossword launch view**

`apps/web/src/features/games/crossword/components/crossword-launch-view.tsx`:

```tsx
"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import { crosswordPlayPath } from "@pasttime/domain/games/crossword"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { CrosswordSettingsWidget } from "@/features/games/crossword/components/crossword-settings-widget"
import { crosswordSearchParams } from "@/features/games/crossword/search-params"
import { useDailyCompleted } from "@/features/games/hooks/use-daily-completed"

interface CrosswordLaunchViewProps {
  game: GameDefinition
}

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

- [ ] **Step 2: Update crossword index exports**

Remove `CrosswordModePicker` export from `apps/web/src/features/games/crossword/components/index.ts`:

```ts
export { CrosswordGrid } from "./crossword-grid"
export { CrosswordLaunchView } from "./crossword-launch-view"
export { CrosswordPlaySettingsWidget } from "./crossword-play-settings-widget"
export { CrosswordPlayView } from "./crossword-play-view"
export { CrosswordSettingsWidget } from "./crossword-settings-widget"
```

- [ ] **Step 3: Delete CrosswordModePicker**

```bash
rm apps/web/src/features/games/crossword/components/crossword-mode-picker.tsx
```

- [ ] **Step 4: Run crossword tests**

```bash
cd apps/web && npx vitest run src/features/games/crossword/ --reporter=verbose
```

Expected: All crossword tests pass (excluding deleted mode-picker tests if any).

- [ ] **Step 5: Check tsc**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/games/crossword/components/
git commit -m "refactor: replace CrosswordModePicker with shared GameLaunchActions + daily hook"
```

---

### Task 6: Word guess launch view refactor

**Files:**
- Modify: `apps/web/src/features/games/word-guess/components/word-guess-launch-view.tsx`
- Delete: `apps/web/src/features/games/word-guess/components/word-guess-launch-actions.tsx`

- [ ] **Step 1: Rewrite word guess launch view**

The parent only passes `{ game }` via dynamic import from module-registry. The hooks must live inside the component, not the parent. The refactored launch view keeps all existing logic (useQueryState, usePlatformRouter, useDailyCompleted) inline and swaps the actions rendering:

`apps/web/src/features/games/word-guess/components/word-guess-launch-view.tsx`:

```tsx
"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import {
  generateRoomCode,
  wordGuessPlayPath,
  wordGuessRoomPath,
  type WordGuessLength,
  type WordGuessRoundMode,
} from "@pasttime/domain/games/word-guess"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { WordGuessSettingsWidget } from "@/features/games/word-guess/components/word-guess-settings-widget"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"
import { useDailyCompleted } from "@/features/games/hooks/use-daily-completed"
import { usePlatformRouter } from "@/platform/navigation"
import { useWordGuessDailyCompleted } from "@/features/games/word-guess/hooks/use-word-guess-daily-completed"

interface WordGuessLaunchViewProps {
  game: GameDefinition
}

export function WordGuessLaunchView({ game }: WordGuessLaunchViewProps) {
  const router = usePlatformRouter()
  const [lettersParam] = useQueryState("letters", wordGuessSearchParams.letters)
  const [modeParam] = useQueryState("mode", wordGuessSearchParams.mode)
  const wordLength = Number(lettersParam) as WordGuessLength
  const mode = modeParam as WordGuessRoundMode

  // Use the universal hook instead of word-guess-specific one
  const isDailyCompleted = useDailyCompleted("word-guess", String(wordLength))
  const playMode = isDailyCompleted ? "random" : "daily"

  function handleCreateRoom() {
    router.push(wordGuessRoomPath(generateRoomCode(), wordLength, mode))
  }

  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <WordGuessSettingsWidget className="mt-6" />
      <GameLaunchActions
        game={game}
        playHref={wordGuessPlayPath(wordLength, playMode)}
        dailyCompleted={isDailyCompleted}
        secondaryAction={
          isDailyCompleted
            ? { label: "View today's results", href: wordGuessPlayPath(wordLength, "daily") }
            : undefined
        }
        onCreateRoom={handleCreateRoom}
        onJoinRoom={() => {}}
      />
    </GamePageShell>
  )
}
```

- [ ] **Step 2: Delete word-guess-launch-actions.tsx**

```bash
rm apps/web/src/features/games/word-guess/components/word-guess-launch-actions.tsx
```

- [ ] **Step 3: Run word guess tests**

```bash
cd apps/web && npx vitest run src/features/games/word-guess/ --reporter=verbose
```

Expected: All word guess tests pass.

- [ ] **Step 4: Run full test suite**

```bash
cd apps/web && npx vitest run --reporter=verbose
```

Expected: All tests pass (65 crossword, word-guess tests, etc.)

- [ ] **Step 5: Check tsc**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/games/word-guess/components/
git commit -m "refactor: replace WordGuessLaunchActions with shared GameLaunchActions"
```

---

### Task 7: Solitaire launch view refactor

**Files:**
- Modify: `apps/web/src/features/games/solitaire/components/solitaire-launch-view.tsx`
- Delete: `apps/web/src/features/games/solitaire/components/solitaire-launch-actions.tsx`

- [ ] **Step 1: Rewrite solitaire launch view**

First, find where `SolitaireLaunchView` is rendered and where the `mode` value comes from:

```bash
grep -rn "SolitaireLaunchView" apps/web/src/
```

If `mode` is resolved inside `SolitaireLaunchActions` via `useQueryState`, move that logic into the launch view or pass it down from the parent.

`apps/web/src/features/games/solitaire/components/solitaire-launch-view.tsx`:

```tsx
"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import { parseSolitaireMode, solitairePlayPath } from "@pasttime/domain/games/solitaire"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { SolitaireSettingsWidget } from "@/features/games/solitaire/components/solitaire-settings-widget"
import { solitaireSearchParams } from "@/features/games/solitaire/search-params"

interface SolitaireLaunchViewProps {
  game: GameDefinition
}

export function SolitaireLaunchView({ game }: SolitaireLaunchViewProps) {
  const [modeParam] = useQueryState("mode", solitaireSearchParams.mode)
  const mode = parseSolitaireMode(modeParam)

  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <SolitaireSettingsWidget className="mt-6" />
      <GameLaunchActions
        game={game}
        playHref={solitairePlayPath(mode)}
        playLabel="Play"
      />
    </GamePageShell>
  )
}
```

- [ ] **Step 2: Delete solitaire-launch-actions.tsx**

```bash
rm apps/web/src/features/games/solitaire/components/solitaire-launch-actions.tsx
```

- [ ] **Step 3: Run solitaire tests**

```bash
cd apps/web && npx vitest run src/features/games/solitaire/ --reporter=verbose
```

Expected: All solitaire tests pass.

- [ ] **Step 4: Check tsc**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/games/solitaire/components/
git commit -m "refactor: replace SolitaireLaunchActions with shared GameLaunchActions"
```

---

### Task 8: Final cleanup and verification

**Files:**
- Verify: All deleted files removed
- Verify: All index exports updated
- Verify: No stale references to deleted components

- [ ] **Step 1: Check for stale imports**

```bash
grep -rn "CrosswordModePicker\|SolitaireLaunchActions\|WordGuessLaunchActions" apps/web/src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "No stale references — clean"
```

Expected: No stale references.

- [ ] **Step 2: Full test run**

```bash
cd apps/web && npx vitest run --reporter=verbose
```

Expected: All tests pass (65+ crossword tests, word-guess tests, solitaire tests).

```bash
cd packages/domain && npx vitest run --reporter=verbose
```

Expected: All 132 domain tests pass.

- [ ] **Step 3: Final tsc check**

```bash
cd apps/web && npx tsc --noEmit
cd packages/domain && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit remaining cleanup**

```bash
git add -A
git commit -m "chore: clean up stale references after launch action refactor"
```
