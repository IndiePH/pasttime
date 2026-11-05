import type { Metadata } from "next"

import {
  GAME_REGISTRY,
  gamePath,
  type GameDefinition,
} from "@pasttime/domain/games"

export const SITE_URL = "https://pasttime.xyz"
export const SITE_NAME = "Pasttime"
export const SITE_DESCRIPTION =
  "Free daily puzzles and classic games in the browser. Play Crossword, Word Guess, Sudoku, Solitaire, Reversi, Type Rush, and Type Shield. No download or account."

/** Bump when public copy, the catalog, or indexable URLs change. */
export const SITE_CONTENT_UPDATED = "2026-11-05"

/**
 * Answer-engine crawlers. Googlebot stays on the `*` group so it can see
 * noindex on play, stats, and room. These agents get the same private paths
 * plus those thin shells, so citations stay on landing pages.
 */
export const AI_CRAWLER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
] as const

export const PRIVATE_ROBOT_PATHS = ["/traffic", "/api/traffic"] as const

export const AI_ROBOT_DISALLOW = [
  ...PRIVATE_ROBOT_PATHS,
  "/games/*/play",
  "/games/*/stats",
  "/games/*/room",
] as const

export function absoluteUrl(path = "/"): string {
  if (path === "/" || path === "") {
    return SITE_URL
  }
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function clipMetaDescription(text: string, max = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= max) {
    return normalized
  }
  const sliced = normalized.slice(0, max - 1)
  const boundary = sliced.lastIndexOf(" ")
  const clipped = (boundary > 80 ? sliced.slice(0, boundary) : sliced).trim()
  return `${clipped}…`
}

type PageMetadataInput = {
  title: string
  description: string
  path: string
  /** Skip the root `%s | Pasttime` template (already branded titles). */
  absoluteTitle?: boolean
  /**
   * Interactive shells (play / stats / room) stay out of the index so
   * crawlers focus on editorial landing pages. Links on those shells
   * remain followable.
   */
  noIndex?: boolean
  /** When this URL repeats another page, point the canonical there. */
  canonicalPath?: string
}

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
  canonicalPath,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path)
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: absoluteUrl(canonicalPath ?? path),
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: true,
            googleBot: {
              index: false,
              follow: true,
            },
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

function playableGames(): GameDefinition[] {
  return GAME_REGISTRY.filter((game) => game.status === "available")
}

const GENRE_BY_TAG: Record<string, string> = {
  word: "Word game",
  cards: "Card game",
  logic: "Logic puzzle",
  puzzle: "Puzzle",
  board: "Board game",
  typing: "Typing game",
  strategy: "Strategy game",
  arcade: "Arcade game",
}

function gameGenres(game: GameDefinition): string[] {
  return [
    ...new Set(
      game.tags.flatMap((tag) => {
        const genre = GENRE_BY_TAG[tag]
        return genre ? [genre] : []
      }),
    ),
  ]
}

function gameFeatureList(game: GameDefinition): string[] {
  const features = ["Free in the browser", "No account required"]
  if (game.tags.includes("daily")) {
    features.push("Daily puzzle")
  }
  if (game.tags.includes("multiplayer")) {
    features.push("Multiplayer rooms")
  }
  if (game.playerCount) {
    features.push(game.playerCount)
  }
  return features
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        email: "feedback@pasttime.xyz",
        knowsAbout: playableGames().map((game) => game.title),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }
}

export function gameCatalogJsonLd(games: readonly GameDefinition[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Games on Pasttime",
    numberOfItems: games.length,
    itemListElement: games.map((game, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: game.title,
      url: absoluteUrl(gamePath(game.id)),
    })),
  }
}

export function breadcrumbJsonLd(
  items: readonly { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqPageJsonLd(
  faqs: readonly { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function gameApplicationJsonLd(
  game: GameDefinition,
  description = game.description,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": absoluteUrl(gamePath(game.id)),
    name: game.title,
    url: absoluteUrl(gamePath(game.id)),
    description,
    applicationCategory: "GameApplication",
    applicationSubCategory: gameGenres(game),
    genre: gameGenres(game),
    featureList: gameFeatureList(game),
    operatingSystem: "Any",
    browserRequirements: "Requires a modern web browser.",
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}
