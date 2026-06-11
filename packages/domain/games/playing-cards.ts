/** Asset folder name under `public/games/cards/<variant>/`. */
export type PlayingCardVariant = "minimal"

export const DEFAULT_PLAYING_CARD_VARIANT: PlayingCardVariant = "minimal"

/** Suit folder names (singular). */
export type PlayingCardSuit = "club" | "diamond" | "heart" | "spade"

export const PLAYING_CARD_SUITS: readonly PlayingCardSuit[] = [
  "club",
  "diamond",
  "heart",
  "spade",
] as const

/** Face filename without extension (e.g. `ace`, `ten`, `king`). */
export type PlayingCardRank =
  | "ace"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six"
  | "seven"
  | "eight"
  | "nine"
  | "ten"
  | "jack"
  | "queen"
  | "king"

export const PLAYING_CARD_RANKS: readonly PlayingCardRank[] = [
  "ace",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "jack",
  "queen",
  "king",
] as const

export type PlayingCardBackVariant = "dark" | "light"

export const PLAYING_CARD_BACK_VARIANTS: readonly PlayingCardBackVariant[] =
  ["dark", "light"] as const

const CARDS_BASE = "/games/cards"

export interface PlayingCardFaceRef {
  variant?: PlayingCardVariant
  suit: PlayingCardSuit
  rank: PlayingCardRank
}

export interface PlayingCardBackRef {
  variant?: PlayingCardVariant
  back: PlayingCardBackVariant
}

/** Public URL for a face SVG: `/games/cards/<variant>/<suit>/<rank>.svg`. */
export function playingCardFaceSrc({
  variant = DEFAULT_PLAYING_CARD_VARIANT,
  suit,
  rank,
}: PlayingCardFaceRef): string {
  return `${CARDS_BASE}/${variant}/${suit}/${rank}.svg`
}

/** Public URL for a back SVG: `/games/cards/<variant>/back/<back>.svg`. */
export function playingCardBackSrc({
  variant = DEFAULT_PLAYING_CARD_VARIANT,
  back,
}: PlayingCardBackRef): string {
  return `${CARDS_BASE}/${variant}/back/${back}.svg`
}

/** Maps pip value 1–13 to rank filename (`1` → `ace`, `13` → `king`). */
export function playingCardRankFromValue(value: number): PlayingCardRank {
  const rank = PLAYING_CARD_RANKS[value - 1]
  if (!rank) {
    throw new RangeError(`Invalid card value: ${value}. Expected 1–13.`)
  }
  return rank
}
