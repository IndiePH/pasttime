import type { GameDefinition, GameStatus } from "./types"

export const GAME_REGISTRY: readonly GameDefinition[] = [
  {
    id: "sample-word",
    title: "Sample Word",
    description: "Guess the hidden word in six tries.",
    status: "coming_soon",
    icon: "sample-word",
    tags: ["word", "daily"],
    playerCount: "1 player",
    duration: "5–10 min",
  },
  {
    id: "sample-grid",
    title: "Sample Grid",
    description: "Group related items into four sets.",
    status: "coming_soon",
    icon: "sample-grid",
    tags: ["logic", "daily"],
    playerCount: "1 player",
    duration: "10–15 min",
  },
] as const

export function getGameById(id: string): GameDefinition | undefined {
  return GAME_REGISTRY.find((game) => game.id === id)
}

export function filterGamesByStatus(
  status: GameStatus | "all",
): GameDefinition[] {
  if (status === "all") {
    return [...GAME_REGISTRY]
  }
  return GAME_REGISTRY.filter((game) => game.status === status)
}

/** Featured row: available games first, else leading registry entries. */
export function getFeaturedGames(
  status: GameStatus | "all" = "all",
  limit = 2,
): GameDefinition[] {
  const pool =
    status === "all"
      ? GAME_REGISTRY
      : GAME_REGISTRY.filter((game) => game.status === status)

  if (status === "available") {
    return pool.slice(0, limit)
  }

  const available = pool.filter((game) => game.status === "available")
  const source = available.length > 0 ? available : pool
  return source.slice(0, limit)
}
