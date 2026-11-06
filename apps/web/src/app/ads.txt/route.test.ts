import { describe, expect, it } from "vitest"

import { GET } from "./route"

describe("GET /ads.txt", () => {
  it("serves the Adsterra website seller file only", async () => {
    const response = GET()
    const body = await response.text()

    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    )
    expect(body).toBe(
      "ownerdomain=pasttime.xyz\nadsterra.com, htfw-3915, DIRECT\n",
    )
    expect(body).not.toContain("ironsrc.com")
    expect(body).not.toContain("unity.com")
  })
})
