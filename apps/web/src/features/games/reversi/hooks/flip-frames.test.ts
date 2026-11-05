import { describe, expect, it } from "vitest"

import type { Disc } from "@pasttime/domain/games/reversi"

import { flipFrames } from "./flip-frames"

describe("flipFrames", () => {
  it("places the new disc, then turns nearer captures first", () => {
    const board: Disc[][] = [["black", "white", "white"]]

    const frames = flipFrames(board, { row: 0, col: 0 }, "black", [
      { row: 0, col: 2 },
      { row: 0, col: 1 },
    ])

    expect(frames.map((frame) => frame.motion)).toEqual([
      { square: { row: 0, col: 0 }, kind: "place", from: null, to: "black" },
      { square: { row: 0, col: 1 }, kind: "flip", from: "white", to: "black" },
      { square: { row: 0, col: 2 }, kind: "flip", from: "white", to: "black" },
    ])
    expect(frames[2]?.board[0]).toEqual(["black", "black", "black"])
  })
})
