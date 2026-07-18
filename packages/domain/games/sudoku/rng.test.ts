import { describe, expect, it } from "vitest"
import { createSudokuRng } from "./rng"

describe("createSudokuRng", () => {
  it("is deterministic for the same seed", () => {
    const a = createSudokuRng(20260718)
    const b = createSudokuRng(20260718)
    expect([a.next(), a.next(), a.int(9)]).toEqual([b.next(), b.next(), b.int(9)])
  })
})
