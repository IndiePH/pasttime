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
  },
  {
    id: "sample-grid",
    title: "Sample Grid",
    description: "Group related items into four sets.",
    status: "coming_soon",
    icon: "sample-grid",
    tags: ["logic", "daily"],
    playerCount: "1 player",
  },
  {
    id: "sample-quiz",
    title: "Sample Quiz",
    description: "Race friends to answer trivia questions.",
    status: "coming_soon",
    icon: "sample-quiz",
    tags: ["trivia", "party", "multiplayer"],
    playerCount: "2–8 players",
  },
  {
    id: "sample-tiles",
    title: "Sample Tiles",
    description: "Flip and match pairs before the timer runs out.",
    status: "available",
    icon: "sample-tiles",
    tags: ["memory", "solo"],
    playerCount: "1 player",
  },
  {
    id: "sample-crew",
    title: "Sample Crew",
    description: "Coordinate with friends to finish the mission in time.",
    status: "available",
    icon: "sample-crew",
    tags: ["co-op", "party", "multiplayer"],
    playerCount: "2–6 players",
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

export function filterGamesByTitle(
  games: readonly GameDefinition[],
  query: string,
): GameDefinition[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return [...games]
  }
  return games.filter((game) =>
    game.title.toLowerCase().includes(normalized),
  )
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
