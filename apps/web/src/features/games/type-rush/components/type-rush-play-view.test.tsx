import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { GameDefinition } from "@pasttime/domain/games"
import type { TypeRushRoundState } from "@pasttime/domain/games/type-rush"
import { TypeRushPlayView } from "./type-rush-play-view"

const MOCK_GAME: GameDefinition = {
  id: "type-rush",
  title: "Type Rush",
  description: "Test game",
  status: "available",
  icon: "type-rush",
  tags: ["typing", "solo"],
}

const ROUND: TypeRushRoundState = {
  promptId: "test",
  text: "a b",
  mode: "daily",
  status: "playing",
  typing: {
    text: "a b",
    entries: [{ expected: "a", actual: "x", correct: false }],
    cursor: 1,
    complete: false,
  },
  elapsedMs: 1_000,
  startedAt: 1_000,
}

vi.mock("nuqs", () => ({
  useQueryState: () => ["daily"],
}))

vi.mock("@/features/games/type-rush/hooks/use-type-rush-game", () => ({
  useTypeRushGame: () => ({
    round: ROUND,
    metrics: {
      correctChars: 0,
      errorChars: 1,
      processedChars: 1,
      accuracy: 0,
      wpm: 0,
      elapsedMs: 1_000,
    },
    loadStatus: "ready",
    elapsedMs: 1_000,
    submitCharacter: vi.fn(),
    restart: vi.fn(),
  }),
}))

describe("TypeRushPlayView passage layout", () => {
  it("keeps the full source passage stable after an incorrect character", () => {
    const { container } = render(
      <TypeRushPlayView game={MOCK_GAME} modeLabel="Solo play" />
    )

    const passageInput = screen.getByRole("textbox")
    expect(
      passageInput.parentElement?.querySelector("[aria-hidden]")?.textContent
    ).toBe("a b")
  })
})
