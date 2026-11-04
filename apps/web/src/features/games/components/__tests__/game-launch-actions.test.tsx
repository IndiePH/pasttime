import { render, screen } from "@testing-library/react"
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
  it("renders How To Play, Play, and Back To Catalog by default", () => {
    render(<GameLaunchActions game={mockGame} playHref="/play" />)
    expect(screen.getByTestId("how-to-play")).toBeInTheDocument()
    expect(screen.getByText("Play")).toBeInTheDocument()
    expect(screen.getByText("Back To Catalog")).toBeInTheDocument()
  })

  it('renders "Play Daily Puzzle" when dailyCompleted is false', () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play?mode=daily"
        dailyCompleted={false}
      />,
    )
    expect(screen.getByText("Play Daily Puzzle")).toBeInTheDocument()
  })

  it('renders "Play Puzzle" when dailyCompleted is true', () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play?mode=random"
        dailyCompleted={true}
      />,
    )
    expect(screen.getByText("Play Puzzle")).toBeInTheDocument()
  })

  it("uses custom playLabel when provided", () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play"
        playLabel="Start Game"
      />,
    )
    expect(screen.getByText("Start Game")).toBeInTheDocument()
  })

  it("renders secondary action when provided", () => {
    render(
      <GameLaunchActions
        game={mockGame}
        playHref="/play"
        secondaryAction={{ label: "View Results", href: "/results" }}
      />,
    )
    expect(screen.getByText("View Results")).toBeInTheDocument()
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
    expect(screen.getByText("Create Room")).toBeInTheDocument()
    expect(screen.getByText("Join Room")).toBeInTheDocument()
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
    expect(screen.getByText("Back To Catalog").closest("a")).toHaveAttribute(
      "href",
      "/",
    )
  })
})
