import { describe, expect, it } from "vitest"

import {
  ENRICHED_WORD_COUNT,
  getEnrichedWord,
  getEnrichedWordsByLength,
  hasEnrichedWord,
  isEnrichedWordLength,
  normalizeEnrichedWord,
} from "./enriched-dictionary"

describe("enriched dictionary loader", () => {
  it("loads at least one entry from the committed data", () => {
    expect(ENRICHED_WORD_COUNT).toBeGreaterThan(0)
  })

  it("looks up known words case-insensitively", () => {
    const upper = getEnrichedWord("GET")
    const lower = getEnrichedWord("cafe")

    expect(upper).toBeDefined()
    expect(upper?.word).toBe("GET")
    expect(lower).toBeDefined()
    expect(lower?.word).toBe("CAFE")
  })

  it("returns undefined for unknown words instead of throwing", () => {
    expect(getEnrichedWord("QXZYP")).toBeUndefined()
    expect(hasEnrichedWord("QXZYP")).toBe(false)
  })

  it("normalizes and reports presence consistently", () => {
    expect(normalizeEnrichedWord("  blow ")).toBe("BLOW")
    expect(hasEnrichedWord("  blow ")).toBe(true)
  })

  it("exposes a read-only list per length", () => {
    const three = getEnrichedWordsByLength(3)

    expect(Array.isArray(three)).toBe(true)
    expect(three.length).toBeGreaterThan(0)
    expect(three.every((e) => e.word.length === 3)).toBe(true)
  })

  it("validates supported lengths", () => {
    expect(isEnrichedWordLength(5)).toBe(true)
    expect(isEnrichedWordLength(2)).toBe(false)
    expect(isEnrichedWordLength(11)).toBe(false)
    expect(isEnrichedWordLength(3.5)).toBe(false)
  })
})
