import { getGameById, type GameDefinition } from "@pasttime/domain/games"
import { describe, expect, it } from "vitest"

import { gameIdFromTrafficPath, selectTopPicks } from "./top-picks"

function games(...ids: string[]): GameDefinition[] {
  return ids.map((id) => {
    const game = getGameById(id)
    if (!game) throw new Error(`missing game ${id}`)
    return game
  })
}

const available = games(
  "word-guess",
  "solitaire",
  "crossword",
  "sudoku",
  "reversi",
  "type-rush",
  "type-shield",
)

describe("selectTopPicks", () => {
  it("reads a game id from landing and nested pages", () => {
    expect(gameIdFromTrafficPath("/games/type-shield")).toBe("type-shield")
    expect(gameIdFromTrafficPath("/games/type-shield/play")).toBe("type-shield")
    expect(gameIdFromTrafficPath("/games/word-guess/room/ABCD")).toBe(
      "word-guess",
    )
    expect(gameIdFromTrafficPath("/")).toBeNull()
  })

  it("ranks the three games with the most views, adding nested pages", () => {
    const picks = selectTopPicks(available, [
      { path: "/games/type-shield", views: 3 },
      { path: "/games/type-rush", views: 3 },
      { path: "/games/type-shield/play", views: 2 },
      { path: "/games/type-shield/stats", views: 1 },
      { path: "/games/type-rush/play", views: 1 },
      { path: "/games/sudoku/play", views: 1 },
      { path: "/games/solitaire/play", views: 1 },
      { path: "/games/solitaire", views: 1 },
      { path: "/games/crossword", views: 1 },
    ])

    expect(picks?.map((game) => game.id)).toEqual([
      "type-shield",
      "type-rush",
      "solitaire",
    ])
  })

  it("breaks equal view counts by title", () => {
    const picks = selectTopPicks(available, [
      { path: "/games/sudoku", views: 4 },
      { path: "/games/crossword", views: 4 },
      { path: "/games/reversi", views: 4 },
    ])

    expect(picks?.map((game) => game.id)).toEqual([
      "crossword",
      "reversi",
      "sudoku",
    ])
  })

  it("ignores games outside the list and returns null when none have views", () => {
    expect(
      selectTopPicks(available, [{ path: "/games/tongits", views: 9 }]),
    ).toBeNull()
    expect(selectTopPicks(available, [])).toBeNull()
    expect(selectTopPicks(available, null)).toBeNull()
  })
})
