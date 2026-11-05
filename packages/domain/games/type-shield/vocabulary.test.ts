import { describe, expect, it } from "vitest"

import { pickTypeShieldWord, typeShieldLengthWeight } from "./vocabulary"

const LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10] as const
const PLAYABLE_LENGTHS = [5, 6, 7, 8, 9, 10] as const
const WORDS = LENGTHS.map((length) => "a".repeat(length))

function lengthCounts(
  difficulty: "easy" | "medium" | "hard" | "nightmare",
  samples: number,
): Map<number, number> {
  const counts = new Map<number, number>()
  for (let seed = 1; seed <= samples; seed += 1) {
    const word = pickTypeShieldWord({
      difficulty,
      words: WORDS,
      active: new Set(),
      seed,
    })
    counts.set(word.length, (counts.get(word.length) ?? 0) + 1)
  }
  return counts
}

describe("typeShieldLengthWeight", () => {
  it("makes longer easy and medium words rarer", () => {
    expect(typeShieldLengthWeight("easy", 5, 5)).toBeGreaterThan(
      typeShieldLengthWeight("easy", 6, 5),
    )
    expect(typeShieldLengthWeight("medium", 5, 5)).toBeGreaterThan(
      typeShieldLengthWeight("medium", 8, 5),
    )
  })

  it("keeps hard even and favors long nightmare words", () => {
    expect(typeShieldLengthWeight("hard", 5, 5)).toBe(
      typeShieldLengthWeight("hard", 10, 5),
    )
    expect(typeShieldLengthWeight("nightmare", 10, 5)).toBeGreaterThan(
      typeShieldLengthWeight("nightmare", 5, 5),
    )
  })
})

describe("pickTypeShieldWord", () => {
  it("caps easy at 6 letters and medium at 8", () => {
    const easy = lengthCounts("easy", 400)
    const medium = lengthCounts("medium", 400)

    expect(Math.min(...easy.keys())).toBeGreaterThanOrEqual(5)
    expect(Math.max(...easy.keys())).toBeLessThanOrEqual(6)
    expect(Math.min(...medium.keys())).toBeGreaterThanOrEqual(5)
    expect(Math.max(...medium.keys())).toBeLessThanOrEqual(8)
    expect(easy.get(5) ?? 0).toBeGreaterThan(easy.get(6) ?? 0)
    expect(medium.get(5) ?? 0).toBeGreaterThan(medium.get(8) ?? 0)
  })

  it("uses every length on hard and prefers long words on nightmare", () => {
    const hard = lengthCounts("hard", 800)
    const nightmare = lengthCounts("nightmare", 800)

    for (const length of PLAYABLE_LENGTHS) {
      expect(hard.get(length) ?? 0).toBeGreaterThan(0)
    }
    expect(hard.get(3) ?? 0).toBe(0)
    expect(hard.get(4) ?? 0).toBe(0)
    expect(nightmare.get(10) ?? 0).toBeGreaterThan(nightmare.get(5) ?? 0)
  })

  it("skips a word that is already falling", () => {
    const word = pickTypeShieldWord({
      difficulty: "easy",
      words: ["cabin", "cable"],
      active: new Set(["cabin"]),
      seed: 4,
    })
    expect(word).toBe("cable")
  })
})
