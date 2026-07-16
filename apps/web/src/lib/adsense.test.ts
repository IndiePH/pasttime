import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  getAdsenseSlotId,
  isAdsenseConfigured,
  normalizeAdsenseClient,
  toAdsTxtPublisherId,
} from "./adsense"

describe("normalizeAdsenseClient", () => {
  it("returns null for empty", () => {
    expect(normalizeAdsenseClient(undefined)).toBeNull()
    expect(normalizeAdsenseClient("  ")).toBeNull()
  })

  it("accepts ca-pub- and pub- forms", () => {
    expect(normalizeAdsenseClient("ca-pub-123")).toBe("ca-pub-123")
    expect(normalizeAdsenseClient("pub-123")).toBe("ca-pub-123")
  })

  it("rejects unknown shapes", () => {
    expect(normalizeAdsenseClient("not-a-publisher")).toBeNull()
  })
})

describe("getAdsenseSlotId / isAdsenseConfigured", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "ca-pub-999")
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_TOP", "111")
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM", "222")
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_HUB", "333")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("maps known slots", () => {
    expect(getAdsenseSlotId("global-top-strip")).toBe("111")
    expect(getAdsenseSlotId("global-bottom-strip")).toBe("222")
    expect(getAdsenseSlotId("hub-grid-card")).toBe("333")
    expect(getAdsenseSlotId("static-below-header")).toBeNull()
  })

  it("is configured only when client and slot exist", () => {
    expect(isAdsenseConfigured("global-top-strip")).toBe(true)
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_TOP", "")
    expect(isAdsenseConfigured("global-top-strip")).toBe(false)
  })
})

describe("toAdsTxtPublisherId", () => {
  it("strips ca- prefix", () => {
    expect(toAdsTxtPublisherId("ca-pub-123")).toBe("pub-123")
    expect(toAdsTxtPublisherId("pub-123")).toBe("pub-123")
  })
})
