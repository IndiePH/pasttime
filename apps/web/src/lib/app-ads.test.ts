import { afterEach, describe, expect, it, vi } from "vitest"

import {
  APP_ADS_OWNER_DOMAIN,
  LEVELPLAY_IRONSOURCE_TAG,
  LEVELPLAY_PUBLISHER_ID,
  UNITY_ADS_TAG,
  buildAppAdsTxt,
} from "./app-ads"

describe("buildAppAdsTxt", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("starts with ownerdomain and includes Unity + ironSource DIRECT", () => {
    const body = buildAppAdsTxt()
    expect(body.startsWith(`ownerdomain=${APP_ADS_OWNER_DOMAIN}\n`)).toBe(true)
    expect(body).toContain(
      `ironsrc.com, ${LEVELPLAY_PUBLISHER_ID}, DIRECT, ${LEVELPLAY_IRONSOURCE_TAG}`,
    )
    expect(body).toContain(`unity.com, 8830872, DIRECT, ${UNITY_ADS_TAG}`)
    expect(body).toContain(`unity3d.com, 8830872, DIRECT, ${UNITY_ADS_TAG}`)
    expect(body).toContain("anzu.io, 691e95644e633a6eee2567ee, RESELLER")
    expect(body).not.toContain("pub-4297882562709937")
  })

  it("omits ironSource DIRECT when publisher ID is explicitly null", () => {
    const body = buildAppAdsTxt({ publisherId: null })
    expect(body).not.toContain("ironsrc.com,")
  })

  it("allows overriding the publisher ID", () => {
    const body = buildAppAdsTxt({ publisherId: "1234" })
    expect(body).toContain(
      `ironsrc.com, 1234, DIRECT, ${LEVELPLAY_IRONSOURCE_TAG}`,
    )
    expect(body).not.toContain(
      `ironsrc.com, ${LEVELPLAY_PUBLISHER_ID}, DIRECT`,
    )
  })
})
