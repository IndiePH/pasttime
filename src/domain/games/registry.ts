import type { GameDefinition, GameStatus } from "./types"

export const GAME_REGISTRY: readonly GameDefinition[] = [
  {
    id: "word-guess",
    title: "Word Guess",
    description: "Guess the hidden word in six tries.",
    status: "available",
    icon: "word-guess",
    tags: ["word", "daily", "multiplayer", "co-op"],
    playerCount: "1–4 players",
    minPlayers: 1,
    maxPlayers: 4,
    featured: true,
  },
  {
    id: "solitaire",
    title: "Solitaire",
    description:
      "Klondike, Pyramid, TriPeaks, FreeCell, and more — pick a mode and play solo.",
    status: "available",
    icon: "solitaire",
    tags: ["cards", "puzzle", "solo"],
    playerCount: "1 player",
    featured: true,
  },
  {
    id: "tongits",
    title: "Tongits",
    description: "Play classic Tongits rounds with draw and discard turns.",
    status: "coming_soon",
    icon: "tongits",
    tags: ["cards", "multiplayer"],
    playerCount: "2–3 players",
    minPlayers: 2,
    maxPlayers: 3,
  },
  {
    id: "pusoy-dos",
    title: "Pusoy Dos",
    description: "Race to empty your hand with sequence and combo plays.",
    status: "coming_soon",
    icon: "pusoy-dos",
    tags: ["cards", "multiplayer"],
    playerCount: "2–4 players",
    minPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: "crossword",
    title: "Crossword",
    description: "Fill the grid using clues across and down.",
    status: "available",
    icon: "crossword",
    tags: ["word", "puzzle", "solo"],
    playerCount: "1 player",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    description: "Complete the number grid with clean logic and no guessing.",
    status: "coming_soon",
    icon: "sudoku",
    tags: ["logic", "puzzle", "solo"],
    playerCount: "1 player",
  },
  {
    id: "reversi",
    title: "Reversi",
    description: "Capture territory by surrounding and flipping enemy tiles.",
    status: "coming_soon",
    icon: "reversi",
    tags: ["board", "strategy", "multiplayer"],
    playerCount: "1–2 players",
    minPlayers: 1,
    maxPlayers: 2,
  },
  {
    id: "fleet-grid",
    title: "Fleet Grid",
    description: "Call coordinates, locate fleets, and sink every ship first.",
    status: "coming_soon",
    icon: "fleet-grid",
    tags: ["board", "strategy", "multiplayer"],
    playerCount: "1–2 players",
    minPlayers: 1,
    maxPlayers: 2,
  },
  {
    id: "spades",
    title: "Spades",
    description: "Win tricks, hit bids, and coordinate with your teammate.",
    status: "coming_soon",
    icon: "spades",
    tags: ["cards", "strategy", "multiplayer"],
    playerCount: "2–4 players",
    minPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: "word-factory",
    title: "Word Factory",
    description: "Build as many valid words as possible from a letter set.",
    status: "coming_soon",
    icon: "word-factory",
    tags: ["word", "puzzle", "multiplayer"],
    playerCount: "1–4 players",
    minPlayers: 1,
    maxPlayers: 4,
  },
  {
    id: "type-rush",
    title: "Type Rush",
    description: "Race by typing prompts quickly and accurately.",
    status: "coming_soon",
    icon: "type-rush",
    tags: ["typing", "arcade", "multiplayer"],
    playerCount: "1–6 players",
    minPlayers: 1,
    maxPlayers: 6,
  },
  {
    id: "type-shield",
    title: "Type Shield",
    description: "Defend your base by typing falling words before impact.",
    status: "coming_soon",
    icon: "type-shield",
    tags: ["typing", "co-op", "multiplayer"],
    playerCount: "1–4 players",
    minPlayers: 1,
    maxPlayers: 4,
  },
  {
    id: "tile-words",
    title: "Tile Words",
    description: "Place letter tiles and outscore opponents with smart words.",
    status: "coming_soon",
    icon: "tile-words",
    tags: ["word", "strategy", "multiplayer"],
    playerCount: "2–4 players",
    minPlayers: 2,
    maxPlayers: 4,
  },
] as const

export function getGameById(id: string): GameDefinition | undefined {
  return GAME_REGISTRY.find((game) => game.id === id)
}

function compareGamesByTitle(a: GameDefinition, b: GameDefinition): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
}

export function sortGamesByTitle(
  games: readonly GameDefinition[],
): GameDefinition[] {
  return [...games].sort(compareGamesByTitle)
}

export function filterGamesByStatus(
  status: GameStatus | "all",
): GameDefinition[] {
  const filtered =
    status === "all"
      ? [...GAME_REGISTRY]
      : GAME_REGISTRY.filter((game) => game.status === status)
  return sortGamesByTitle(filtered)
}

export function filterGamesByTitle(
  games: readonly GameDefinition[],
  query: string,
): GameDefinition[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return sortGamesByTitle(games)
  }
  return sortGamesByTitle(
    games.filter((game) => game.title.toLowerCase().includes(normalized)),
  )
}

/**
 * Hub “Top picks” row: `featured` games, title order.
 * Legacy slice fallback only for `all` and `available`; other status filters
 * return empty when nothing is featured.
 */
export function getFeaturedGames(
  status: GameStatus | "all" = "all",
  limit = 2,
): GameDefinition[] {
  const pool =
    status === "all"
      ? GAME_REGISTRY
      : GAME_REGISTRY.filter((game) => game.status === status)

  const highlighted = pool.filter((game) => game.featured)
  if (highlighted.length > 0) {
    return sortGamesByTitle(highlighted).slice(0, limit)
  }

  if (status === "available") {
    return sortGamesByTitle(pool).slice(0, limit)
  }

  if (status === "all") {
    const available = pool.filter((game) => game.status === "available")
    const source = available.length > 0 ? available : pool
    return sortGamesByTitle(source).slice(0, limit)
  }

  return []
}
