import { describe, expect, it } from "vitest"

import {
  createTypeRushRound,
  getTypeRushStorageKey,
  parseStoredTypeRushRound,
  submitTypeRushCharacter,
  TYPE_RUSH_PROMPTS,
} from "./index"

describe("Type Rush persistence", () => {
  it("uses date-scoped daily and session-scoped practice keys", () => {
    const date = new Date("2026-11-04T12:00:00Z")

    expect(getTypeRushStorageKey("daily", date)).toBe(
      "type-rush:daily:default:20261104"
    )
    expect(getTypeRushStorageKey("practice", date)).toBe(
      "type-rush:practice:session"
    )
    expect(getTypeRushStorageKey("daily", date, "numbers")).toBe(
      "type-rush:daily:numbers:20261104"
    )
    expect(getTypeRushStorageKey("practice", date, "numbers-punctuation")).toBe(
      "type-rush:practice:numbers-punctuation:session"
    )
  })

  it("parses a valid round and restarts its open timer segment", () => {
    let round = createTypeRushRound({
      mode: "practice",
      prompt: TYPE_RUSH_PROMPTS[0],
      now: 1_000,
    })
    round = submitTypeRushCharacter(round, round.text[0], 2_000)

    const parsed = parseStoredTypeRushRound(round, "practice", 10_000)

    expect(parsed).toMatchObject({
      text: TYPE_RUSH_PROMPTS[0].text,
      elapsedMs: 0,
      startedAt: 10_000,
      status: "playing",
    })
  })

  it("rejects malformed rounds and mismatched prompts", () => {
    expect(parseStoredTypeRushRound(null, "daily")).toBeNull()
    expect(
      parseStoredTypeRushRound(
        {
          promptId: "steady-start",
          text: "changed",
          mode: "daily",
          status: "playing",
          typing: {
            text: "changed",
            entries: [],
            cursor: 0,
            complete: false,
          },
          elapsedMs: 0,
          startedAt: null,
        },
        "daily"
      )
    ).toBeNull()
  })

  it("restores generated content types", () => {
    const round = createTypeRushRound({
      mode: "daily",
      contentType: "numbers-punctuation",
      date: new Date("2026-11-04T12:00:00Z"),
    })

    expect(
      parseStoredTypeRushRound(
        round,
        "daily",
        10_000,
        "numbers-punctuation"
      )
    ).toMatchObject({
      contentType: "numbers-punctuation",
      text: round.text,
    })
  })

  it("restores a generated paragraph slice", () => {
    const round = createTypeRushRound({
      mode: "daily",
      date: new Date("2026-11-04T12:00:00Z"),
    })

    expect(parseStoredTypeRushRound(round, "daily", 10_000)).toMatchObject({
      contentType: "paragraph",
      text: round.text,
    })
  })
})
