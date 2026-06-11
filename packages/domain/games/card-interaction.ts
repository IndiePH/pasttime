const defaultCardDragEnabled: Record<string, boolean> = {
  solitaire: true,
}

const cardDragOverrides: Record<string, boolean> = {}

export function isCardDragEnabled(gameId: string): boolean {
  if (gameId in cardDragOverrides) {
    return cardDragOverrides[gameId]!
  }

  return defaultCardDragEnabled[gameId] ?? false
}

/** Toggle card drag for a game at runtime (feature flags, tests, etc.). */
export function setCardDragEnabled(gameId: string, enabled: boolean): void {
  cardDragOverrides[gameId] = enabled
}
