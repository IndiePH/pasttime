import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { GameDefinition } from "@pasttime/domain/games"
import { getDailySeed } from "@pasttime/domain/daily"

import { SolitaireLaunchView } from "./solitaire-launch-view"

const storageMap = new Map<string, unknown>()
const query = vi.hoisted(() => ({ mode: "klondike-draw1" }))

vi.mock("nuqs", () => ({
  useQueryState: (key: string) => [key === "mode" ? query.mode : "daily", vi.fn()],
}))

vi.mock("@/infrastructure/storage", () => ({
  useStorage: () => ({
    get: <T,>(key: string) => (storageMap.get(key) as T) ?? null,
    set: <T,>(key: string, value: T) => {
      storageMap.set(key, value)
    },
    remove: (key: string) => {
      storageMap.delete(key)
    },
    clear: () => {
      storageMap.clear()
    },
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

vi.mock("@/features/games/components/game-how-to-play", () => ({
  GameHowToPlay: () => null,
}))

vi.mock("@/features/games/components/game-session-header", () => ({
  GameSessionHeader: () => null,
}))

vi.mock("@/features/games/solitaire/components/solitaire-settings-widget", () => ({
  SolitaireSettingsWidget: () => null,
}))

vi.mock("@/features/games/content/game-overview-section", () => ({
  GameOverviewSection: () => null,
}))

const game = {
  id: "solitaire",
  title: "Solitaire",
  description: "Klondike",
  status: "available",
  icon: "spade",
  tags: [],
} as GameDefinition

describe("SolitaireLaunchView daily contract", () => {
  beforeEach(() => {
    storageMap.clear()
    query.mode = "klondike-draw1"
  })

  it("shows only Play daily puzzle before today's deal is won", () => {
    render(<SolitaireLaunchView game={game} />)

    const play = screen.getByRole("link", { name: "Play daily puzzle" })
    expect(play).toHaveAttribute(
      "href",
      "/games/solitaire/play?mode=klondike-draw1&round=daily",
    )
    expect(screen.queryByRole("link", { name: "Play puzzle" })).toBeNull()
  })

  it("shows only Play puzzle after today's daily is won", () => {
    storageMap.set(`solitaire:daily:klondike-draw1:${getDailySeed(new Date())}`, {
      status: "won",
    })

    render(<SolitaireLaunchView game={game} />)

    const play = screen.getByRole("link", { name: "Play puzzle" })
    expect(play).toHaveAttribute(
      "href",
      "/games/solitaire/play?mode=klondike-draw1&round=random",
    )
    expect(screen.queryByRole("link", { name: "Play daily puzzle" })).toBeNull()
  })
})
