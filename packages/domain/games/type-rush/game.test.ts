import { describe, expect, it } from "vitest"

import {
  createTypeRushRound,
  formatTypeRushContentTypeLabel,
  formatTypeRushDailyPlayLabel,
  getTypeRushMetrics,
  pickTypeRushPrompt,
  submitTypeRushCharacter,
  typeRushPlayPath,
} from "./index"

describe("Type Rush game", () => {
  it("selects the same daily prompt for the same date", () => {
    const first = pickTypeRushPrompt("daily", new Date("2026-11-04T12:00:00Z"))
    const second = pickTypeRushPrompt("daily", new Date("2026-11-04T23:00:00Z"))

    expect(second).toEqual(first)
  })

  it("generates each configured content type deterministically for daily play", () => {
    const date = new Date("2026-11-04T12:00:00Z")
    const contentTypes = [
      "paragraph",
      "words",
      "numbers",
      "numbers-punctuation",
    ] as const

    for (const contentType of contentTypes) {
      const first = createTypeRushRound({
        mode: "daily",
        contentType,
        date,
      })
      const second = createTypeRushRound({
        mode: "daily",
        contentType,
        date,
      })

      expect(second).toEqual(first)
      expect(first.contentType).toBe(contentType)
      expect(first.text.length).toBeGreaterThan(0)

      if (contentType === "paragraph") {
        const sentenceCount = first.text.match(/\./g)?.length ?? 0
        expect(sentenceCount).toBeGreaterThanOrEqual(3)
        expect(sentenceCount).toBeLessThanOrEqual(5)
      }
    }
  })

  it("allows a custom prompt for focused round tests", () => {
    const round = createTypeRushRound({
      mode: "practice",
      prompt: { id: "test", text: "ab" },
      now: 1_000,
    })

    expect(round.text).toBe("ab")
    expect(round.status).toBe("playing")
    expect(round.startedAt).toBeNull()
  })

  it("can request a fresh practice route", () => {
    expect(typeRushPlayPath("practice", "words", true)).toBe(
      "/games/type-rush/play?mode=practice&content=words&fresh=true"
    )
  })

  it("labels the daily action for the selected content type", () => {
    expect(formatTypeRushContentTypeLabel("paragraph")).toBe("Paragraph")
    expect(formatTypeRushContentTypeLabel("words")).toBe("Word Stream")
    expect(formatTypeRushContentTypeLabel("numbers")).toBe("Whole Numbers")
    expect(formatTypeRushContentTypeLabel("numbers-punctuation")).toBe(
      "Decimal Numbers"
    )

    expect(formatTypeRushDailyPlayLabel("paragraph")).toBe(
      "Play Daily Paragraph"
    )
    expect(formatTypeRushDailyPlayLabel("words")).toBe(
      "Play Daily Word Stream"
    )
    expect(formatTypeRushDailyPlayLabel("numbers")).toBe(
      "Play Daily Whole Numbers"
    )
    expect(formatTypeRushDailyPlayLabel("numbers-punctuation")).toBe(
      "Play Daily Decimal Numbers"
    )
  })

  it("starts timing on the first character and completes forgivingly", () => {
    let round = createTypeRushRound({
      mode: "practice",
      prompt: { id: "test", text: "ab" },
      now: 1_000,
    })

    round = submitTypeRushCharacter(round, "x", 2_000)
    expect(round.status).toBe("playing")
    expect(round.startedAt).toBe(2_000)

    round = submitTypeRushCharacter(round, "b", 3_500)

    expect(round.status).toBe("won")
    expect(round.startedAt).toBeNull()
    expect(round.elapsedMs).toBe(1_500)
    expect(getTypeRushMetrics(round)).toMatchObject({
      correctChars: 1,
      errorChars: 1,
      processedChars: 2,
      accuracy: 0.5,
    })
  })

  it("reports the live elapsed time from the round start timestamp", () => {
    let round = createTypeRushRound({
      mode: "practice",
      prompt: { id: "test", text: "ab" },
      now: 1_000,
    })

    round = submitTypeRushCharacter(round, "a", 2_000)

    expect(getTypeRushMetrics(round, 2_750).elapsedMs).toBe(750)
  })

  it("ignores input after the round is complete", () => {
    const round = createTypeRushRound({
      mode: "practice",
      prompt: { id: "test", text: "a" },
    })
    const completed = submitTypeRushCharacter(round, "a", 10)
    const unchanged = submitTypeRushCharacter(completed, "b", 20)

    expect(unchanged).toBe(completed)
  })
})
