import type { PlayingCardSuit } from "../../playing-cards"

export type KlondikeStatus = "playing" | "won"

export interface KlondikeCard {
  id: string
  suit: PlayingCardSuit
  /** Pip value 1 (ace) through 13 (king). */
  rank: number
  faceUp: boolean
}

export type KlondikeFoundationIndex = 0 | 1 | 2 | 3

export type KlondikeTableauIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type KlondikePileRef =
  | { pile: "stock" }
  | { pile: "waste" }
  | { pile: "foundation"; index: KlondikeFoundationIndex }
  | { pile: "tableau"; index: KlondikeTableauIndex }

export interface KlondikeState {
  stock: KlondikeCard[]
  waste: KlondikeCard[]
  foundations: [
    KlondikeCard[],
    KlondikeCard[],
    KlondikeCard[],
    KlondikeCard[],
  ]
  tableau: [
    KlondikeCard[],
    KlondikeCard[],
    KlondikeCard[],
    KlondikeCard[],
    KlondikeCard[],
    KlondikeCard[],
    KlondikeCard[],
  ]
  status: KlondikeStatus
  moves: number
  seed: number | null
}

export type KlondikeMove =
  | { type: "draw" }
  | { type: "recycle" }
  | {
      type: "move"
      from: KlondikePileRef
      cardCount: number
      to: KlondikePileRef
    }
  | { type: "auto-foundation"; from: KlondikePileRef }

export type KlondikeMoveResult =
  | { ok: true; state: KlondikeState }
  | { ok: false; reason: KlondikeMoveRejectReason }

export type KlondikeMoveRejectReason =
  | "game-complete"
  | "invalid-move"
  | "empty-stock"
  | "stock-not-empty"
  | "nothing-to-recycle"
