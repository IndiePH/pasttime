import { describe, expect, it } from "vitest"

import {
  buildEnrichedWordIndex,
  getEnrichedWordFromIndex,
  isEnrichedWordLength,
  normalizeEnrichedWord,
} from "./enriched-dictionary"

const FIXTURE = buildEnrichedWordIndex([
  {
    word: "ACE",
    definition: "A single point or spot on a playing card or die.",
    synonyms: ["pip"],
    antonyms: [],
  },
  {
    word: "AGE",
    definition: "The whole duration of a being.",
    synonyms: [],
    antonyms: [],
  },
])

describe("enriched dictionary helpers", () => {
  it("indexes entries by word and length", () => {
    expect(FIXTURE.byWord.size).toBe(2)
    expect(FIXTURE.byLength.get(3)?.length).toBe(2)
  })

  it("looks up known words case-insensitively", () => {
    const upper = getEnrichedWordFromIndex("ACE", FIXTURE.byWord)
    const lower = getEnrichedWordFromIndex("age", FIXTURE.byWord)

    expect(upper).toBeDefined()
    expect(upper?.word).toBe("ACE")
    expect(lower).toBeDefined()
    expect(lower?.word).toBe("AGE")
  })

  it("returns undefined for unknown words instead of throwing", () => {
    expect(getEnrichedWordFromIndex("QXZYP", FIXTURE.byWord)).toBeUndefined()
  })

  it("normalizes consistently", () => {
    expect(normalizeEnrichedWord("  ace ")).toBe("ACE")
  })

  it("validates supported lengths", () => {
    expect(isEnrichedWordLength(5)).toBe(true)
    expect(isEnrichedWordLength(4)).toBe(false)
    expect(isEnrichedWordLength(11)).toBe(false)
    expect(isEnrichedWordLength(3.5)).toBe(false)
  })
})
