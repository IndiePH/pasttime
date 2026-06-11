import {
  PLAYING_CARD_RANKS,
  PLAYING_CARD_SUITS,
  type PlayingCardRank,
  type PlayingCardSuit,
} from "../../playing-cards"

import type { KlondikeCard } from "./types"

function rankFromPlayingCardRank(rank: PlayingCardRank): number {
  return PLAYING_CARD_RANKS.indexOf(rank) + 1
}

export function createKlondikeDeck(): KlondikeCard[] {
  const cards: KlondikeCard[] = []
  let id = 0

  for (const suit of PLAYING_CARD_SUITS) {
    for (const rank of PLAYING_CARD_RANKS) {
      cards.push({
        id: `card-${id}`,
        suit,
        rank: rankFromPlayingCardRank(rank),
        faceUp: false,
      })
      id += 1
    }
  }

  return cards
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (Math.imul(1_664_525, state) + 1_013_904_223) >>> 0
    return state / 4_294_967_296
  }
}

export function shuffleKlondikeDeck(
  deck: KlondikeCard[],
  seed: number | null,
): KlondikeCard[] {
  const next = [...deck]
  const random =
    seed === null ? Math.random : createSeededRandom(seed)

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = next[index]
    next[index] = next[swapIndex] as KlondikeCard
    next[swapIndex] = current
  }

  return next
}

export function suitOrder(suit: PlayingCardSuit): number {
  return PLAYING_CARD_SUITS.indexOf(suit)
}
