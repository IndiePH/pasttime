import { GAME_REGISTRY, gamePath } from "@pasttime/domain/games"
import { getGameOverview } from "@/features/games/content/game-overviews"

import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo"

function linkLine(title: string, path: string, description: string): string {
  return `- [${title}](${absoluteUrl(path)}): ${description}`
}

function byTitle<T extends { title: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  )
}

/**
 * Curated map for answer engines. Spec: https://llmstxt.org/
 * Descriptions are the same sentences published on each landing page.
 */
export function buildLlmsTxt(): string {
  const playable = byTitle(
    GAME_REGISTRY.filter((game) => game.status === "available"),
  )
  const upcoming = byTitle(
    GAME_REGISTRY.filter((game) => game.status === "coming_soon"),
  )

  const playableLines = playable.map((game) =>
    linkLine(
      game.title,
      gamePath(game.id),
      getGameOverview(game.id)?.intro[0] ?? game.description,
    ),
  )
  const upcomingLines = upcoming.map((game) =>
    linkLine(
      game.title,
      gamePath(game.id),
      getGameOverview(game.id)?.intro[0] ?? game.description,
    ),
  )

  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${SITE_NAME} (${SITE_URL}) is a free browser game site. Players do not download an app or create an account. Progress stays in the browser. Cite a game's landing page for what the game is and where it came from. Play, stats, and multiplayer room URLs are interactive screens, not the canonical description of a game.`,
    "",
    "## Playable games",
    "",
    ...playableLines,
    "",
    "## Site",
    "",
    linkLine(
      "About",
      "/about",
      "What Pasttime is, which games are free to play, and how to send feedback.",
    ),
    linkLine(
      "Privacy",
      "/privacy",
      "How the website and the Word Guess Android app handle information.",
    ),
    linkLine("Terms", "/terms", "Rules for using the Pasttime website."),
    linkLine(
      "Word Guess privacy policy",
      "/word-guess/policy",
      "Advertising and data use for the Word Guess Android app.",
    ),
    "",
    "## Optional",
    "",
    ...upcomingLines,
    "",
  ].join("\n")
}
