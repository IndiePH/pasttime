import { describe, expect, it } from "vitest"

import {
  countryFlag,
  countryLabel,
  createVisitorId,
  decideTrafficWrite,
  digestKey,
  hashVisitorId,
  hexTokensMatch,
  hitToken,
  normalizeCountry,
  normalizeTrafficPath,
  parseTrafficRange,
  trafficSinceDay,
  visitorId,
} from "./traffic"

const NOW = Date.parse("2026-11-04T15:00:00.000Z")

function decide(
  overrides: Partial<Parameters<typeof decideTrafficWrite>[0]> = {},
) {
  return decideTrafficWrite({
    sameSite: true,
    userAgent: "Mozilla/5.0 Chrome/120",
    path: "/games/crossword",
    hitCookie: undefined,
    country: "us",
    now: NOW,
    ...overrides,
  })
}

describe("traffic path and country", () => {
  it("keeps a site path and drops queries", () => {
    expect(normalizeTrafficPath("/games/sudoku/play?daily=1")).toBe(
      "/games/sudoku/play",
    )
  })

  it("rejects off-site, private, and asset paths", () => {
    expect(normalizeTrafficPath("https://evil.test/")).toBeNull()
    expect(normalizeTrafficPath("/games/../privacy")).toBeNull()
    expect(normalizeTrafficPath("/traffic")).toBeNull()
    expect(normalizeTrafficPath("/api/feedback")).toBeNull()
    expect(normalizeTrafficPath("/sitemap.xml")).toBeNull()
  })

  it("normalizes country codes and labels", () => {
    expect(normalizeCountry("us")).toBe("US")
    expect(normalizeCountry("T1")).toBe("T1")
    expect(normalizeCountry("USA")).toBe("XX")
    expect(normalizeCountry(null)).toBe("XX")
    expect(countryLabel("US")).toBe("United States")
    expect(countryLabel("T1")).toBe("Tor")
    expect(countryLabel("XX")).toBe("Unknown")
    expect(countryFlag("US")).toBe("🇺🇸")
    expect(countryFlag("T1")).toBe("")
  })
})

describe("decideTrafficWrite", () => {
  it("records a page view", () => {
    expect(decide()).toEqual({
      action: "record",
      day: "2026-11-04",
      country: "US",
      path: "/games/crossword",
      hit: hitToken("/games/crossword", NOW),
    })
  })

  it("records another path in the same day", () => {
    expect(decide({ path: "/" })).toMatchObject({ action: "record", path: "/" })
  })

  it("ignores a repeat of the same page inside the hit window", () => {
    const first = decide()
    expect(first.action).toBe("record")
    if (first.action !== "record") return
    expect(decide({ hitCookie: first.hit })).toEqual({ action: "ignore" })
  })

  it("ignores other sites and known crawlers", () => {
    expect(decide({ sameSite: false })).toEqual({ action: "ignore" })
    expect(
      decide({
        userAgent:
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      }),
    ).toEqual({ action: "ignore" })
  })

  it("stores unknown countries without dropping the view", () => {
    expect(decide({ country: "" })).toMatchObject({
      action: "record",
      country: "XX",
    })
  })
})

describe("visitor identity", () => {
  it("accepts only a version 4 id", () => {
    const id = createVisitorId()
    expect(visitorId(id)).toBe(id)
    expect(visitorId(` ${id.toUpperCase()} `)).toBe(id)
    expect(visitorId("not-a-visitor")).toBeNull()
    expect(visitorId(undefined)).toBeNull()
  })

  it("hashes the id without keeping it", async () => {
    const id = "11111111-1111-4111-8111-111111111111"
    const hash = await hashVisitorId(id)
    expect(hash).toHaveLength(64)
    expect(hash).not.toContain(id)
    expect(await hashVisitorId(id)).toBe(hash)
    expect(await hashVisitorId(createVisitorId())).not.toBe(hash)
  })
})

describe("traffic view key", () => {
  it("matches only the same key", async () => {
    const expected = await digestKey("correct horse")
    expect(hexTokensMatch(await digestKey("correct horse"), expected)).toBe(true)
    expect(hexTokensMatch(await digestKey("wrong horse"), expected)).toBe(false)
    expect(hexTokensMatch("short", expected)).toBe(false)
  })

  it("parses the summary range", () => {
    expect(parseTrafficRange("7")).toBe(7)
    expect(parseTrafficRange("90")).toBe(90)
    expect(parseTrafficRange("14")).toBe(30)
    expect(parseTrafficRange(["30"])).toBe(30)
    expect(trafficSinceDay(7, new Date(NOW))).toBe("2026-10-29")
  })
})
