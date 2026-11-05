import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { GameDefinition } from "@pasttime/domain/games"

import {
  REVERSI_MATCH_HISTORY_KEY,
} from "../hooks/use-reversi-match-history"
import { ReversiStatsView } from "./reversi-stats-view"

vi.mock("@/platform/navigation", () => ({
  PlatformLink: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock("@/features/games/components/game-session-header", () => ({
  GameSessionHeader: () => null,
}))

const game: GameDefinition = {
  id: "reversi",
  title: "Reversi",
  description: "Capture territory by surrounding and flipping enemy tiles.",
  status: "available",
  icon: "reversi",
  tags: ["board", "strategy"],
  playerCount: "1 player",
}

describe("ReversiStatsView", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders the boxing-style record and Reversi metrics", async () => {
    window.localStorage.setItem(
      REVERSI_MATCH_HISTORY_KEY,
      JSON.stringify([
        { blackScore: 38, whiteScore: 26, result: "win", timestamp: 1 },
        { blackScore: 29, whiteScore: 35, result: "loss", timestamp: 2 },
        { blackScore: 32, whiteScore: 32, result: "draw", timestamp: 3 },
      ]),
    )

    render(<ReversiStatsView game={game} />)

    await waitFor(() => {
      expect(screen.getByText("1–1–1")).toBeTruthy()
    })
    expect(screen.getByText("3")).toBeTruthy()
    expect(screen.getByText("33.3%")).toBeTruthy()
    expect(screen.getByText("W Wins · L Losses · D Draws")).toBeTruthy()
    expect(screen.getByText("+12")).toBeTruthy()
    expect(screen.getByText("+2.0")).toBeTruthy()
  })

  it("shows the shared empty state before the first completed match", () => {
    render(<ReversiStatsView game={game} />)

    expect(screen.getByText("No stats yet")).toBeTruthy()
    expect(
      screen.getByText(
        "Finish a Reversi game to see your record and score margins here.",
      ),
    ).toBeTruthy()
  })
})
