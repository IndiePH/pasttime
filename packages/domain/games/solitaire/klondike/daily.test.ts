import { describe, expect, it } from "vitest"

import { getDailySeed, hashSeed } from "../../../daily"
import { createKlondikeGame } from "./game"
import { getKlondikeStorageKey, klondikeDailySeed } from "./daily"

function cardIds(state: ReturnType<typeof createKlondikeGame>): string[] {
  return [
    ...state.tableau.flatMap((column) => column.map((card) => card.id)),
    ...state.stock.map((card) => card.id),
  ]
}

describe("klondike daily deal", () => {
  const date = new Date("2026-11-04T15:00:00Z")

  it("deals the same board for the same seed and draw count", () => {
    const seed = klondikeDailySeed(date, 1)
    const first = createKlondikeGame({ seed, drawCount: 1 })
    const second = createKlondikeGame({ seed, drawCount: 1 })

    expect(seed).toBe(hashSeed(getDailySeed(date) + 97))
    expect(cardIds(first)).toEqual(cardIds(second))
    expect(first.seed).toBe(seed)
    expect(first.drawCount).toBe(1)
  })

  it("uses a different seed and board for draw 3 on the same date", () => {
    const draw1 = klondikeDailySeed(date, 1)
    const draw3 = klondikeDailySeed(date, 3)
    const first = createKlondikeGame({ seed: draw1, drawCount: 1 })
    const second = createKlondikeGame({ seed: draw3, drawCount: 3 })

    expect(draw3).toBe(hashSeed(getDailySeed(date) + 3 * 97))
    expect(draw1).not.toBe(draw3)
    expect(cardIds(first)).not.toEqual(cardIds(second))
  })

  it("deals a different board on the next UTC date", () => {
    const today = createKlondikeGame({
      seed: klondikeDailySeed(new Date("2026-11-04T23:30:00Z"), 1),
      drawCount: 1,
    })
    const tomorrow = createKlondikeGame({
      seed: klondikeDailySeed(new Date("2026-11-05T00:30:00Z"), 1),
      drawCount: 1,
    })

    expect(today.seed).not.toBe(tomorrow.seed)
    expect(cardIds(today)).not.toEqual(cardIds(tomorrow))
  })

  it("keeps the same seed across hours of one UTC date", () => {
    expect(klondikeDailySeed(new Date("2026-11-04T00:30:00Z"), 1)).toBe(
      klondikeDailySeed(new Date("2026-11-04T23:30:00Z"), 1),
    )
  })
})

describe("getKlondikeStorageKey", () => {
  const date = new Date("2026-11-04T15:00:00Z")

  it("builds the daily key useDailyCompleted reads", () => {
    expect(getKlondikeStorageKey("klondike-draw1", "daily", date)).toBe(
      "solitaire:daily:klondike-draw1:20261104",
    )
    expect(getKlondikeStorageKey("klondike-draw3", "daily", date)).toBe(
      "solitaire:daily:klondike-draw3:20261104",
    )
  })

  it("builds a date-independent random key", () => {
    expect(getKlondikeStorageKey("klondike-draw1", "random", date)).toBe(
      "solitaire:random:klondike-draw1",
    )
  })
})
