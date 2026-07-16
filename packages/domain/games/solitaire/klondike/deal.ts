import { createKlondikeDeck, shuffleKlondikeDeck } from "./deck"
import type { KlondikeState } from "./types"

export function dealKlondikeState(seed: number | null, drawCount: 1 | 3 = 1): KlondikeState {
  const shuffled = shuffleKlondikeDeck(createKlondikeDeck(), seed)
  const tableau: KlondikeState["tableau"] = [[], [], [], [], [], [], []]
  let cursor = 0

  for (let column = 0; column < 7; column += 1) {
    for (let row = 0; row <= column; row += 1) {
      const card = shuffled[cursor]
      cursor += 1
      if (!card) {
        throw new Error("Deck exhausted during Klondike deal")
      }

      tableau[column].push({
        ...card,
        faceUp: row === column,
      })
    }
  }

  const stock = shuffled.slice(cursor).map((card) => ({
    ...card,
    faceUp: false,
  }))

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    status: "playing",
    moves: 0,
    seed,
    drawCount,
  }
}
