import { describe, expect, it } from "vitest"

import { buildKlondikeShareText } from "./share"

describe("buildKlondikeShareText", () => {
  it("includes the UTC date, draw mode, and move count", () => {
    const text = buildKlondikeShareText({
      drawCount: 3,
      moves: 87,
      elapsedLabel: "4:12",
      puzzleDate: new Date("2026-11-04T18:00:00Z"),
      shareUrl: "https://pasttime.xyz/games/solitaire",
    })

    expect(text).toContain("Pasttime Solitaire\nDaily · 2026-11-04")
    expect(text).toContain("Draw 3")
    expect(text).toContain("87 moves")
    expect(text).toContain("4:12")
    expect(text.endsWith("https://pasttime.xyz/games/solitaire")).toBe(true)
  })

  it("labels draw 1 and omits card identities", () => {
    const text = buildKlondikeShareText({
      drawCount: 1,
      moves: 42,
      puzzleDate: new Date("2026-11-04T00:30:00Z"),
    })

    expect(text).toContain("Draw 1")
    expect(text).toContain("42 moves")
    expect(text.toLowerCase()).not.toMatch(/heart|spade|diamond|club|ace|king|queen|jack/)
  })
})
