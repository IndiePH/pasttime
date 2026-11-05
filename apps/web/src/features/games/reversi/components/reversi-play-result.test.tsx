import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { GameDefinition } from "@pasttime/domain/games"
import type { Disc, Session } from "@pasttime/domain/games/reversi"

import { ReversiPlayView } from "./reversi-play-view"

const board: Disc[][] = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) =>
    row * 8 + col < 40 ? "black" : "white",
  ),
)

const SESSION: Session = {
  position: {
    board,
    turn: "black",
    status: "ended",
    winner: "black",
    lastPass: null,
  },
  seats: {
    black: { kind: "human" },
    white: { kind: "computer", difficulty: "medium" },
  },
}

const GAME: GameDefinition = {
  id: "reversi",
  title: "Reversi",
  description: "Capture territory by surrounding and flipping enemy tiles.",
  status: "available",
  icon: "reversi",
  tags: ["board", "strategy"],
  playerCount: "1 player",
}

vi.mock("@/features/games/reversi/hooks/use-reversi-game", () => ({
  useReversiGame: () => ({
    session: SESSION,
    board,
    motion: null,
    flippingLabel: null,
    place: vi.fn(),
    newGame: vi.fn(),
  }),
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

describe("ReversiPlayView result dialog", () => {
  it("opens a noticeable result dialog when the match ends", async () => {
    render(<ReversiPlayView game={GAME} modeLabel="Solo play" />)

    expect(
      await screen.findByRole("dialog", { name: "Black wins!" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Final score 40–24")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Stats" })).toHaveAttribute(
      "href",
      "/games/reversi/stats",
    )
  })
})
