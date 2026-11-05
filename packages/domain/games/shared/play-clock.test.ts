import { describe, expect, it } from "vitest"

import {
  formatPlayElapsed,
  livePlayElapsedMs,
  readStoredPlayClock,
  reconcilePlayClock,
  sealPlayClock,
} from "./play-clock"

describe("formatPlayElapsed", () => {
  it("formats sub-hour durations as m:ss", () => {
    expect(formatPlayElapsed(0)).toBe("0:00")
    expect(formatPlayElapsed(5_000)).toBe("0:05")
    expect(formatPlayElapsed(65_000)).toBe("1:05")
    expect(formatPlayElapsed(59 * 60_000 + 59_000)).toBe("59:59")
  })

  it("formats durations at or over an hour as h:mm:ss", () => {
    expect(formatPlayElapsed(60 * 60_000)).toBe("1:00:00")
    expect(formatPlayElapsed(60 * 60_000 + 61_000)).toBe("1:01:01")
  })

  it("clamps negative durations to zero", () => {
    expect(formatPlayElapsed(-1_000)).toBe("0:00")
  })
})

describe("readStoredPlayClock", () => {
  it("treats missing fields as zero and starts a new playing segment", () => {
    expect(readStoredPlayClock({ status: "playing" }, 8_000)).toEqual({
      elapsedMs: 0,
      startedAt: 8_000,
    })
  })

  it("keeps accumulated time and drops a stale playing startedAt", () => {
    expect(
      readStoredPlayClock(
        { status: "playing", elapsedMs: 12_000, startedAt: 1 },
        9_000_000,
      ),
    ).toEqual({ elapsedMs: 12_000, startedAt: 9_000_000 })
  })

  it("keeps a finished round frozen", () => {
    expect(
      readStoredPlayClock(
        { status: "won", elapsedMs: 40_000, startedAt: 1_000 },
        9_000_000,
      ),
    ).toEqual({ elapsedMs: 40_000, startedAt: 1_000 })
  })
})

describe("reconcilePlayClock", () => {
  const previous = {
    status: "playing",
    elapsedMs: 4_000,
    startedAt: 1_000,
  }

  it("flushes the open segment while playing", () => {
    const next = { ...previous, status: "playing" }
    expect(reconcilePlayClock(previous, next, 3_500)).toEqual({
      status: "playing",
      elapsedMs: 6_500,
      startedAt: 3_500,
    })
  })

  it("flushes through a win and then stops adding time", () => {
    const won = reconcilePlayClock(previous, { ...previous, status: "won" }, 3_000)
    expect(won).toEqual({ status: "won", elapsedMs: 6_000, startedAt: 3_000 })
    expect(livePlayElapsedMs(won, won.status, 20_000)).toBe(6_000)
  })

  it("starts a new segment when play resumes without adding closed time", () => {
    const frozen = { status: "won", elapsedMs: 6_000, startedAt: 3_000 }
    expect(
      reconcilePlayClock(frozen, { ...frozen, status: "playing" }, 50_000),
    ).toEqual({ status: "playing", elapsedMs: 6_000, startedAt: 50_000 })
  })
})

describe("sealPlayClock", () => {
  const playing = {
    status: "playing",
    elapsedMs: 4_000,
    startedAt: 1_000,
    moves: 2,
  }

  it("folds idle time into elapsedMs without a move", () => {
    expect(sealPlayClock(playing, 61_000)).toEqual({
      status: "playing",
      elapsedMs: 64_000,
      startedAt: 61_000,
      moves: 2,
    })
  })

  it("leaves a finished round frozen", () => {
    const won = { ...playing, status: "won" }
    expect(sealPlayClock(won, 90_000)).toBe(won)
  })

  it("does not rewind when the clock has not moved", () => {
    expect(sealPlayClock(playing, 1_000)).toBe(playing)
  })
})
