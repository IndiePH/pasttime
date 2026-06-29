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
