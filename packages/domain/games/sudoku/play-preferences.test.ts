import { describe, expect, it } from "vitest"

import {
  SUDOKU_PLAY_PREFERENCES_DEFAULT,
  SUDOKU_PLAY_PREFERENCES_STORAGE_KEY,
  readSudokuPlayPreferences,
  writeSudokuPlayPreferences,
} from "./play-preferences"

describe("SUDOKU_PLAY_PREFERENCES_DEFAULT", () => {
  it("defaults autoCandidates to false", () => {
    expect(SUDOKU_PLAY_PREFERENCES_DEFAULT).toEqual({ autoCandidates: false })
  })
})

describe("SUDOKU_PLAY_PREFERENCES_STORAGE_KEY", () => {
  it("is the expected storage key", () => {
    expect(SUDOKU_PLAY_PREFERENCES_STORAGE_KEY).toBe("sudoku:play-prefs")
  })
})

describe("readSudokuPlayPreferences", () => {
  it("returns defaults when nothing is stored", () => {
    const result = readSudokuPlayPreferences(<T>() => null as T | null)

    expect(result).toEqual({ autoCandidates: false })
  })

  it("returns defaults when the stored value is not an object", () => {
    const result = readSudokuPlayPreferences(<T>() => "garbage" as unknown as T)

    expect(result).toEqual({ autoCandidates: false })
  })

  it("discards a non-boolean stored autoCandidates value", () => {
    const result = readSudokuPlayPreferences(
      <T>() => ({ autoCandidates: "yes" }) as unknown as T,
    )

    expect(result.autoCandidates).toBe(false)
  })

  it("preserves a stored true value", () => {
    const result = readSudokuPlayPreferences(
      <T>() => ({ autoCandidates: true }) as unknown as T,
    )

    expect(result.autoCandidates).toBe(true)
  })
})

describe("writeSudokuPlayPreferences", () => {
  it("writes preferences under the storage key", () => {
    const calls: Array<{ key: string; value: unknown }> = []
    const set = (key: string, value: unknown) => {
      calls.push({ key, value })
    }

    writeSudokuPlayPreferences(set, { autoCandidates: true })

    expect(calls).toEqual([
      { key: "sudoku:play-prefs", value: { autoCandidates: true } },
    ])
  })
})
