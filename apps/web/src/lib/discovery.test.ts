import { describe, expect, it } from "vitest"

import robots from "@/app/robots"
import sitemap from "@/app/sitemap"
import { hubFaqs } from "@/features/hub/hub-faq"
import { SITE_CONTENT_UPDATED, SITE_URL } from "@/lib/seo"

describe("crawl files", () => {
  it("publishes a stable sitemap without the duplicate games hub", () => {
    const entries = sitemap()
    const urls = entries.map((entry) => entry.url)
    expect(urls[0]).toBe(SITE_URL)
    expect(urls).not.toContain(`${SITE_URL}/games`)
    expect(urls).toContain(`${SITE_URL}/games/sudoku`)
    expect(entries[0]?.lastModified).toEqual(new Date(SITE_CONTENT_UPDATED))
  })

  it("lets answer engines read landings and skip private or thin shells", () => {
    const rules = robots().rules
    const groups = Array.isArray(rules) ? rules : [rules]
    const ai = groups.find(
      (rule) =>
        Array.isArray(rule.userAgent) && rule.userAgent.includes("GPTBot"),
    )
    expect(ai?.allow).toBe("/")
    expect(ai?.disallow).toEqual(
      expect.arrayContaining(["/traffic", "/games/*/play"]),
    )
  })
})

describe("hub answers", () => {
  it("names games that can be played today", () => {
    const which = hubFaqs().find((faq) =>
      faq.question.startsWith("Which games"),
    )
    expect(which?.answer).toContain("Type Shield")
    expect(which?.answer).toContain("Reversi")
    expect(which?.answer).not.toContain("Tongits")
  })
})
