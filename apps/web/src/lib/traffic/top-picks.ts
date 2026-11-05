import type { GameDefinition } from "@pasttime/domain/games"

export const TOP_PICKS_LIMIT = 3

const GAME_PATH = /^\/games\/([^/]+)(?:\/|$)/

export function gameIdFromTrafficPath(path: string): string | null {
  return GAME_PATH.exec(path)?.[1] ?? null
}

/**
 * Playable games with the most page views, highest first.
 * Landing, play, stats, and room paths for the same game are added together.
 * Returns null when no listed game has views, so the hub can keep its
 * manual featured row.
 */
export function selectTopPicks(
  games: readonly GameDefinition[],
  pathViews: readonly { path: string; views: number }[] | null,
  limit = TOP_PICKS_LIMIT,
): GameDefinition[] | null {
  if (!pathViews) return null

  const ids = new Set(games.map((game) => game.id))
  const views = new Map<string, number>()
  for (const row of pathViews) {
    const id = gameIdFromTrafficPath(row.path)
    if (!id || !ids.has(id) || row.views <= 0) continue
    views.set(id, (views.get(id) ?? 0) + row.views)
  }
  if (views.size === 0) return null

  return [...games]
    .sort((a, b) => {
      const byViews = (views.get(b.id) ?? 0) - (views.get(a.id) ?? 0)
      if (byViews !== 0) return byViews
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    })
    .slice(0, limit)
}
