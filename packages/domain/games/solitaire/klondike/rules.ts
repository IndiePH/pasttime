import { areOppositeColors } from "./card-utils"
import type { KlondikeCard } from "./types"

export function canPlaceOnFoundation(
  card: KlondikeCard,
  foundation: KlondikeCard[],
): boolean {
  if (!card.faceUp) {
    return false
  }

  const top = foundation[foundation.length - 1]
  if (!top) {
    return card.rank === 1
  }

  return card.suit === top.suit && card.rank === top.rank + 1
}

export function canPlaceOnTableau(
  card: KlondikeCard,
  column: KlondikeCard[],
): boolean {
  if (!card.faceUp) {
    return false
  }

  const top = column[column.length - 1]
  if (!top) {
    return card.rank === 13
  }

  if (!top.faceUp) {
    return false
  }

  return areOppositeColors(card, top) && card.rank === top.rank - 1
}

export function canStackOnTableau(
  movingCards: KlondikeCard[],
  column: KlondikeCard[],
): boolean {
  if (movingCards.length === 0) {
    return false
  }

  const bottomCard = movingCards[0]
  if (!bottomCard?.faceUp) {
    return false
  }

  for (const card of movingCards) {
    if (!card.faceUp) {
      return false
    }
  }

  for (let index = 1; index < movingCards.length; index += 1) {
    const previous = movingCards[index - 1]
    const current = movingCards[index]
    if (
      !previous ||
      !current ||
      previous.rank !== current.rank + 1 ||
      !areOppositeColors(previous, current)
    ) {
      return false
    }
  }

  return canPlaceOnTableau(bottomCard, column)
}
