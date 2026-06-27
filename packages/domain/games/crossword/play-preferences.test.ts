import { describe, expect, it } from "vitest"

import {
  CROSSWORD_PLAY_PREFERENCES_DEFAULT,
  readCrosswordPlayPreferences,
} from "./play-preferences"

describe("CROSSWORD_PLAY_PREFERENCES_DEFAULT", () => {
  it("includes the 4 direction-indicator toggles set to true", () => {
    const d = CROSSWORD_PLAY_PREFERENCES_DEFAULT as Record<string, boolean>
    expect(d.showWordSpanHighlight).toBe(true)
    expect(d.showCornerArrowGlyph).toBe(true)
    expect(d.showDirectionBorderColor).toBe(true)
    expect(d.blinkActiveClue).toBe(true)
  })
})

describe("readCrosswordPlayPreferences", () => {
  it("returns defaults for missing fields (migration from old 2-field prefs)", () => {
    const result = readCrosswordPlayPreferences(() => ({
      showErrors: true,
      autoCheck: false,
    })) as Record<string, boolean>
    expect(result.showWordSpanHighlight).toBe(true)
    expect(result.showCornerArrowGlyph).toBe(true)
    expect(result.showDirectionBorderColor).toBe(true)
    expect(result.blinkActiveClue).toBe(true)
  })

  it("discards non-boolean stored values for direction-indicator fields", () => {
    const result = readCrosswordPlayPreferences(() => ({
      showWordSpanHighlight: "yes",
    })) as Record<string, boolean>
    expect(result.showWordSpanHighlight).toBe(true)
  })

  it("preserves stored boolean values for direction-indicator fields", () => {
    const result = readCrosswordPlayPreferences(() => ({
      showWordSpanHighlight: false,
      showCornerArrowGlyph: false,
      showDirectionBorderColor: true,
      blinkActiveClue: false,
    })) as Record<string, boolean>
    expect(result.showWordSpanHighlight).toBe(false)
    expect(result.showCornerArrowGlyph).toBe(false)
    expect(result.showDirectionBorderColor).toBe(true)
    expect(result.blinkActiveClue).toBe(false)
  })
})
