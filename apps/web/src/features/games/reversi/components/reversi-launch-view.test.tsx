import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { GameDefinition } from "@pasttime/domain/games"

import { ReversiLaunchView } from "./reversi-launch-view"

vi.mock("@/platform/navigation", () => ({
  PlatformLink: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock("@/features/games/components/game-how-to-play", () => ({
  GameHowToPlay: () => null,
}))

vi.mock("@/features/games/components/game-session-header", () => ({
  GameSessionHeader: () => null,
}))

vi.mock("@/features/games/reversi/components/reversi-settings-widget", () => ({
  ReversiSettingsWidget: () => null,
}))

vi.mock("@/features/games/content/game-overview-section", () => ({
  GameOverviewSection: () => null,
}))

const game = {
  id: "reversi",
  title: "Reversi",
  description: "Capture territory by surrounding and flipping enemy tiles.",
  status: "available",
  icon: "reversi",
  tags: ["board", "strategy"],
  playerCount: "1 player",
} as GameDefinition

describe("ReversiLaunchView", () => {
  it("shows the shared Stats action", () => {
    render(<ReversiLaunchView game={game} />)

    expect(screen.getByRole("link", { name: "Stats" })).toHaveAttribute(
      "href",
      "/games/reversi/stats",
    )
  })
})
