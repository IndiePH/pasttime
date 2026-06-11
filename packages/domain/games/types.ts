export type GameStatus = "available" | "coming_soon"

/** Internal icon ids — maps to SVG components in L3 only */
export type GameIconId =
  | "word-guess"
  | "solitaire"
  | "tongits"
  | "pusoy-dos"
  | "crossword"
  | "sudoku"
  | "reversi"
  | "fleet-grid"
  | "spades"
  | "word-factory"
  | "type-rush"
  | "type-shield"
  | "tile-words"

export function isMultiplayerGame(game: GameDefinition): boolean {
  return game.tags.includes("multiplayer")
}

export function isCardGame(game: GameDefinition): boolean {
  return game.tags.includes("cards")
}

export type MultiplayerPlayerLimits = {
  minPlayers: number
  maxPlayers: number
}

const DEFAULT_MULTIPLAYER_LIMITS: MultiplayerPlayerLimits = {
  minPlayers: 2,
  maxPlayers: 8,
}

export function getMultiplayerPlayerLimits(
  game: GameDefinition,
): MultiplayerPlayerLimits | null {
  if (!isMultiplayerGame(game)) {
    return null
  }
  return {
    minPlayers: game.minPlayers ?? DEFAULT_MULTIPLAYER_LIMITS.minPlayers,
    maxPlayers: game.maxPlayers ?? DEFAULT_MULTIPLAYER_LIMITS.maxPlayers,
  }
}

export type GameDefinition = {
  id: string
  title: string
  description: string
  status: GameStatus
  icon: GameIconId
  tags: string[]
  playerCount?: string
  /** Minimum players required to start a multiplayer room */
  minPlayers?: number
  /** Maximum players allowed in a multiplayer room */
  maxPlayers?: number
  launchedAt?: string
  /** Hub “Top picks” row when true */
  featured?: boolean
}

export function gamePath(id: string): string {
  return `/games/${id}`
}
