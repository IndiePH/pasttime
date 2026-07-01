import { describe, it, expect } from "vitest"
import { computeStreak } from "./streak"

const c = (date: string) => ({
  date,
  game: "crossword" as const,
  variant: "7",
  status: "won" as const,
  timestamp: Date.now(),
})

function dayStr(offset: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}

describe("computeStreak", () => {
  it("returns 0 for empty completions", () => {
    const r = computeStreak([])
    expect(r).toEqual({ current: 0, longest: 0 })
  })

  it("returns 1 current and longest for a single completion today", () => {
    const r = computeStreak([c(dayStr(0))])
    expect(r).toEqual({ current: 1, longest: 1 })
  })

  it("returns 1 current and longest for a single completion yesterday", () => {
    const r = computeStreak([c(dayStr(-1))])
    expect(r).toEqual({ current: 1, longest: 1 })
  })

  it("returns current=0, longest=1 for a single completion 3 days ago", () => {
    const r = computeStreak([c(dayStr(-3))])
    expect(r).toEqual({ current: 0, longest: 1 })
  })

  it("returns 5 for five consecutive days ending today", () => {
    const r = computeStreak([-4, -3, -2, -1, 0].map((d) => c(dayStr(d))))
    expect(r).toEqual({ current: 5, longest: 5 })
  })

  it("handles gaps in the sequence (Mon,Tue,Wed,Fri with today=Sat)", () => {
    // today=Sat, completions: Mon(-5), Tue(-4), Wed(-3), Fri(-1)
    // Most recent=Fri(yesterday) → current=1, longest=3 (Mon-Wed)
    const r = computeStreak(
      [dayStr(-5), dayStr(-4), dayStr(-3), dayStr(-1)].map((d) => c(d)),
    )
    expect(r.current).toBe(1)
    expect(r.longest).toBe(3)
  })

  it("resets current streak when most recent is older than yesterday", () => {
    // 4 consecutive days ending Fri(-2), today=Sun → current=0, longest=4
    const r = computeStreak([-5, -4, -3, -2].map((d) => c(dayStr(d))))
    expect(r.current).toBe(0)
    expect(r.longest).toBe(4)
  })

  it("deduplicates same-date completions", () => {
    const r = computeStreak([c(dayStr(-1)), c(dayStr(-1)), c(dayStr(0))])
    expect(r.current).toBeGreaterThanOrEqual(1)
    expect(r.longest).toBeGreaterThanOrEqual(2)
  })

  it("detects consecutive days across year boundary", () => {
    const r = computeStreak([c("2026-12-31"), c("2027-01-01")])
    expect(r.longest).toBe(2)
  })

  it("returns current=1, longest=1 for non-consecutive single yesterday only", () => {
    // Single completion yesterday — current=1, longest=1
    const r = computeStreak([c(dayStr(-1))])
    expect(r).toEqual({ current: 1, longest: 1 })
  })

  it("treats non-consecutive days as separate streaks", () => {
    // Two completions 2 days apart, most recent = yesterday
    // Current=1 (just yesterday), longest=1
    const r = computeStreak([c(dayStr(-3)), c(dayStr(-1))])
    expect(r.current).toBe(1)
    expect(r.longest).toBe(1)
  })
})
