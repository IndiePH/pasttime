import type { Metadata } from "next"

import { gamePath, type GameDefinition } from "@pasttime/domain/games"

export const SITE_URL = "https://pasttime.xyz"
export const SITE_NAME = "Pasttime"
export const SITE_DESCRIPTION =
  "Free daily puzzles and classic games in the browser: Crossword, Word Guess, Sudoku, Solitaire, and more. No download required."

export function absoluteUrl(path = "/"): string {
  if (path === "/" || path === "") {
    return SITE_URL
  }
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

type PageMetadataInput = {
  title: string
  description: string
  path: string
  /** Skip the root `%s | Pasttime` template (already branded titles). */
  absoluteTitle?: boolean
  /**
   * Interactive shells (play / stats / room) stay out of the index so
   * crawlers focus on editorial landing pages.
   */
  noIndex?: boolean
}

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path)
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
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

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "en",
      },
    ],
  }
}

export function gameApplicationJsonLd(game: GameDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: game.title,
    url: absoluteUrl(gamePath(game.id)),
    description: game.description,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}
