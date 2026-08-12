import { describe, expect, it } from "vitest"

import {
  absoluteUrl,
  gameApplicationJsonLd,
  pageMetadata,
  SITE_NAME,
  SITE_URL,
  websiteJsonLd,
} from "./seo"

describe("seo helpers", () => {
  it("builds absolute URLs", () => {
    expect(absoluteUrl("/")).toBe(SITE_URL)
    expect(absoluteUrl("")).toBe(SITE_URL)
    expect(absoluteUrl("/games")).toBe(`${SITE_URL}/games`)
    expect(absoluteUrl("games/sudoku")).toBe(`${SITE_URL}/games/sudoku`)
  })

  it("sets canonical and social metadata", () => {
    const meta = pageMetadata({
      title: "Games",
      description: "Browse free games.",
      path: "/games",
    })

    expect(meta.title).toBe("Games")
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/games`)
    expect(meta.openGraph).toMatchObject({
      title: "Games",
      url: `${SITE_URL}/games`,
      siteName: SITE_NAME,
      type: "website",
    })
    expect(meta.twitter).toMatchObject({
      card: "summary",
      title: "Games",
    })
  })

  it("supports absolute titles that skip the root template", () => {
    const meta = pageMetadata({
      title: "Pasttime — Play more. Think sharper.",
      description: "Hub description",
      path: "/",
      absoluteTitle: true,
    })

    expect(meta.title).toEqual({
      absolute: "Pasttime — Play more. Think sharper.",
    })
  })

  it("marks interactive shells as noindex", () => {
    const meta = pageMetadata({
      title: "Play Sudoku",
      description: "Play now.",
      path: "/games/sudoku/play",
      noIndex: true,
    })

    expect(meta.robots).toEqual({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    })
  })

  it("builds Website + Organization JSON-LD", () => {
    const jsonLd = websiteJsonLd()
    expect(jsonLd["@context"]).toBe("https://schema.org")
    expect(jsonLd["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "Organization",
          name: SITE_NAME,
        }),
        expect.objectContaining({
          "@type": "WebSite",
          url: SITE_URL,
        }),
      ]),
    )
  })

  it("builds WebApplication JSON-LD for a game", () => {
    const jsonLd = gameApplicationJsonLd({
      id: "sudoku",
      title: "Sudoku",
      description: "Complete the number grid.",
      status: "available",
      icon: "sudoku",
      tags: ["logic"],
    })

    expect(jsonLd).toMatchObject({
      "@type": "WebApplication",
      name: "Sudoku",
      url: `${SITE_URL}/games/sudoku`,
      applicationCategory: "GameApplication",
      offers: { price: "0", priceCurrency: "USD" },
    })
  })
})
