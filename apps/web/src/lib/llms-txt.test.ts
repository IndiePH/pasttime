import { describe, expect, it } from "vitest"

import { buildLlmsTxt } from "./llms-txt"
import { SITE_URL } from "./seo"

describe("llms.txt", () => {
  const text = buildLlmsTxt()

  it("maps playable games to landing pages", () => {
    expect(text).toContain("# Pasttime")
    expect(text).toContain(`${SITE_URL}/games/type-shield`)
    expect(text).toContain(`${SITE_URL}/games/reversi`)
    expect(text).toContain(`${SITE_URL}/about`)
    expect(text).not.toContain("/play")
    expect(text).not.toContain("/traffic")
  })

  it("keeps unreleased games out of the playable section", () => {
    const playable = text.split("## Optional")[0] ?? ""
    expect(playable).not.toContain("Tongits")
    expect(text).toContain("Tongits")
  })
})
