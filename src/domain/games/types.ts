export type GameStatus = "available" | "coming_soon"

/** Internal icon ids — maps to SVG components in L3 only */
export type GameIconId = "sample-word" | "sample-grid"

export type GameDefinition = {
  id: string
  title: string
  description: string
  status: GameStatus
  icon: GameIconId
  tags: string[]
  playerCount?: string
  duration?: string
  launchedAt?: string
}

export function gamePath(id: string): string {
  return `/games/${id}`
}
