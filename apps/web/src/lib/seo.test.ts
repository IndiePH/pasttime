import { describe, expect, it } from "vitest"

import {
  absoluteUrl,
  AI_CRAWLER_AGENTS,
  AI_ROBOT_DISALLOW,
  breadcrumbJsonLd,
  clipMetaDescription,
  faqPageJsonLd,
  gameApplicationJsonLd,
  gameCatalogJsonLd,
  pageMetadata,
  SITE_CONTENT_UPDATED,
  SITE_DESCRIPTION,
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
      title: "Pasttime | Play more. Think sharper.",
      description: "Hub description",
      path: "/",
      absoluteTitle: true,
    })

    expect(meta.title).toEqual({
      absolute: "Pasttime | Play more. Think sharper.",
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
      follow: true,
      googleBot: {
        index: false,
        follow: true,
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
      genre: ["Logic puzzle"],
      offers: { price: "0", priceCurrency: "USD" },
    })
  })

  it("clips long descriptions on a word boundary", () => {
    const source = "Pasttime Crossword is a free American-style grid in the browser: interlocking across and down answers, a shared daily puzzle, and random boards when you want another round."
    const clipped = clipMetaDescription(source)
    expect(clipped.length).toBeLessThanOrEqual(160)
    expect(clipped.endsWith("…")).toBe(true)
    expect(clipped.endsWith(" …")).toBe(false)
  })

  it("can canonicalize a duplicate URL at a different path", () => {
    const meta = pageMetadata({
      title: "Games",
      description: "Catalog",
      path: "/games",
      canonicalPath: "/",
    })
    expect(meta.alternates?.canonical).toBe(SITE_URL)
    expect(meta.openGraph).toMatchObject({ url: `${SITE_URL}/games` })
  })

  it("names the playable catalog in the site description and organization", () => {
    expect(SITE_DESCRIPTION).toContain("Type Shield")
    expect(SITE_DESCRIPTION).toContain("Reversi")
    const jsonLd = websiteJsonLd()
    const organization = jsonLd["@graph"].find(
      (node) => node["@type"] === "Organization",
    )
    expect(organization).toMatchObject({
      email: "feedback@pasttime.xyz",
      knowsAbout: expect.arrayContaining(["Type Shield", "Reversi"]),
    })
    const website = jsonLd["@graph"].find((node) => node["@type"] === "WebSite")
    expect(website).toMatchObject({
      potentialAction: {
        "@type": "SearchAction",
        "query-input": "required name=search_term_string",
      },
    })
  })

  it("builds catalog, breadcrumb, and FAQ JSON-LD from the same facts", () => {
    expect(
      gameCatalogJsonLd([
        {
          id: "sudoku",
          title: "Sudoku",
          description: "Grid",
          status: "available",
          icon: "sudoku",
          tags: ["logic"],
        },
      ]).itemListElement,
    ).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Sudoku",
        url: `${SITE_URL}/games/sudoku`,
      },
    ])

    expect(
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Sudoku", path: "/games/sudoku" },
      ]).itemListElement,
    ).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Sudoku",
        item: `${SITE_URL}/games/sudoku`,
      },
    ])

    expect(
      faqPageJsonLd([{ question: "Is Pasttime free?", answer: "Yes." }])
        .mainEntity,
    ).toEqual([
      {
        "@type": "Question",
        name: "Is Pasttime free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes." },
      },
    ])
  })

  it("keeps answer-engine crawlers on landing pages", () => {
    expect(AI_CRAWLER_AGENTS).toEqual(
      expect.arrayContaining(["OAI-SearchBot", "PerplexityBot", "ClaudeBot"]),
    )
    expect(AI_ROBOT_DISALLOW).toEqual(
      expect.arrayContaining([
        "/traffic",
        "/api/traffic",
        "/games/*/play",
        "/games/*/stats",
        "/games/*/room",
      ]),
    )
    expect(SITE_CONTENT_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
