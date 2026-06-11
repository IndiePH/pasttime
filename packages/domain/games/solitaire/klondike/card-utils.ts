import type { PlayingCardSuit } from "../../playing-cards"

import type { KlondikeCard } from "./types"

const RED_SUITS = new Set<PlayingCardSuit>(["diamond", "heart"])

export function klondikeCardColor(
  suit: PlayingCardSuit,
): "red" | "black" {
  return RED_SUITS.has(suit) ? "red" : "black"
}

export function areOppositeColors(a: KlondikeCard, b: KlondikeCard): boolean {
  return klondikeCardColor(a.suit) !== klondikeCardColor(b.suit)
}

export function isValidRank(rank: number): boolean {
  return Number.isInteger(rank) && rank >= 1 && rank <= 13
}
