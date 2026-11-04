import { describe, expect, it } from "vitest"

import {
  backspaceTypingCharacter,
  createTypingState,
  getTypingCharacterStatus,
  normalizeTypingText,
  submitTypingCharacter,
} from "./input"

describe("typing input", () => {
  it("normalizes line endings into spaces without changing punctuation", () => {
    expect(normalizeTypingText("One\r\nTwo\nThree.")).toBe("One Two Three.")
  })

  it("advances through correct and incorrect characters", () => {
    let state = createTypingState("Ab!")

    state = submitTypingCharacter(state, "a")
    state = submitTypingCharacter(state, "x")
    state = submitTypingCharacter(state, "!")

    expect(state.cursor).toBe(3)
    expect(state.complete).toBe(true)
    expect(state.entries).toEqual([
      { expected: "A", actual: "a", correct: true },
      { expected: "b", actual: "x", correct: false },
      { expected: "!", actual: "!", correct: true },
    ])
    expect(getTypingCharacterStatus(state, 0)).toBe("correct")
    expect(getTypingCharacterStatus(state, 1)).toBe("incorrect")
  })

  it("does not advance on invalid control input or after completion", () => {
    let state = createTypingState("a")

    state = submitTypingCharacter(state, "Enter")
    state = submitTypingCharacter(state, "a")
    const completed = submitTypingCharacter(state, "b")

    expect(state.complete).toBe(true)
    expect(state.entries).toHaveLength(1)
    expect(completed).toBe(state)
  })

  it("rejects incorrect characters in strict mode", () => {
    const state = submitTypingCharacter(createTypingState("a"), "b", "strict")

    expect(state.cursor).toBe(0)
    expect(state.entries).toEqual([])
    expect(getTypingCharacterStatus(state, 0)).toBe("current")
  })

  it("removes the last character so it can be typed again", () => {
    let state = createTypingState("ab")
    state = submitTypingCharacter(state, "a")
    state = submitTypingCharacter(state, "x")
    state = backspaceTypingCharacter(state)
    state = submitTypingCharacter(state, "b")

    expect(state.entries).toEqual([
      { expected: "a", actual: "a", correct: true },
      { expected: "b", actual: "b", correct: true },
    ])
    expect(state.complete).toBe(true)
  })

  it("marks the current and pending positions", () => {
    const state = submitTypingCharacter(createTypingState("ab"), "a")

    expect(getTypingCharacterStatus(state, 0)).toBe("correct")
    expect(getTypingCharacterStatus(state, 1)).toBe("current")
    expect(getTypingCharacterStatus(state, 2)).toBe("pending")
  })
})
