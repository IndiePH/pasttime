import { describe, expect, it } from "vitest"

import {
  applyKlondikeMove,
  createKlondikeGame,
  getKlondikeAutoFoundationMove,
  getKlondikeNextAutoCompleteMove,
  isKlondikeAutoCompleteReady,
} from "./game"
import type { KlondikeCard, KlondikeState } from "./types"

function card(
  id: string,
  suit: KlondikeCard["suit"],
  rank: number,
  faceUp = true,
): KlondikeCard {
  return { id, suit, rank, faceUp }
}

function baseState(overrides: Partial<KlondikeState> = {}): KlondikeState {
  return {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    status: "playing",
    moves: 0,
    seed: 42,
    ...overrides,
  }
}

describe("createKlondikeGame", () => {
  it("deals 52 cards across stock and tableau", () => {
    const state = createKlondikeGame({ seed: 99 })
    const tableauCount = state.tableau.reduce(
      (total, column) => total + column.length,
      0,
    )
    const foundationCount = state.foundations.reduce(
      (total, pile) => total + pile.length,
      0,
    )

    expect(tableauCount).toBe(28)
    expect(state.stock.length + state.waste.length + foundationCount).toBe(24)
    expect(state.tableau[6]).toHaveLength(7)
    expect(state.tableau[6]?.[6]?.faceUp).toBe(true)
  })

  it("is deterministic for the same seed", () => {
    const first = createKlondikeGame({ seed: 7 })
    const second = createKlondikeGame({ seed: 7 })

    expect(first.tableau[0]?.[0]?.id).toBe(second.tableau[0]?.[0]?.id)
    expect(first.stock.map((item) => item.id)).toEqual(
      second.stock.map((item) => item.id),
    )
  })
})

describe("applyKlondikeMove", () => {
  it("draws from stock to waste", () => {
    const state = baseState({
      stock: [card("s1", "club", 5, false)],
      waste: [],
    })

    const result = applyKlondikeMove(state, { type: "draw" })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.stock).toHaveLength(0)
      expect(result.state.waste).toEqual([
        card("s1", "club", 5, true),
      ])
      expect(result.state.moves).toBe(1)
    }
  })

  it("recycles waste into stock when stock is empty", () => {
    const state = baseState({
      stock: [],
      waste: [card("w1", "heart", 3, true), card("w2", "spade", 9, true)],
    })

    const result = applyKlondikeMove(state, { type: "recycle" })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.waste).toHaveLength(0)
      expect(result.state.stock).toEqual([
        card("w2", "spade", 9, false),
        card("w1", "heart", 3, false),
      ])
    }
  })

  it("moves a waste card onto a valid tableau column", () => {
    const state = baseState({
      waste: [card("w1", "heart", 10, true)],
      tableau: [
        [],
        [card("t1", "spade", 11, true)],
        [],
        [],
        [],
        [],
        [],
      ],
    })

    const result = applyKlondikeMove(state, {
      type: "move",
      from: { pile: "waste" },
      cardCount: 1,
      to: { pile: "tableau", index: 1 },
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.waste).toHaveLength(0)
      expect(result.state.tableau[1]).toHaveLength(2)
      expect(result.state.tableau[1]?.[1]?.id).toBe("w1")
    }
  })

  it("flips the newly exposed tableau card after a move", () => {
    const state = baseState({
      tableau: [
        [card("hidden", "club", 4, false), card("top", "diamond", 3, true)],
        [card("t1", "spade", 4, true)],
        [],
        [],
        [],
        [],
        [],
      ],
    })

    const result = applyKlondikeMove(state, {
      type: "move",
      from: { pile: "tableau", index: 0 },
      cardCount: 1,
      to: { pile: "tableau", index: 1 },
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.tableau[0]).toEqual([
        card("hidden", "club", 4, true),
      ])
    }
  })

  it("auto-moves an ace to foundation", () => {
    const state = baseState({
      waste: [card("a1", "heart", 1, true)],
    })

    const move = getKlondikeAutoFoundationMove(state, { pile: "waste" })
    expect(move).toEqual({ type: "auto-foundation", from: { pile: "waste" } })

    const result = applyKlondikeMove(state, move as NonNullable<typeof move>)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.foundations.some((pile) => pile.length === 1)).toBe(
        true,
      )
    }
  })

  it("auto-moves the top tableau card to foundation", () => {
    const state = baseState({
      foundations: [[card("f1", "heart", 1, true)]],
      tableau: [
        [
          card("hidden", "club", 4, false),
          card("top", "heart", 2, true),
        ],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    })

    const move = getKlondikeAutoFoundationMove(state, {
      pile: "tableau",
      index: 0,
    })
    expect(move).toEqual({
      type: "auto-foundation",
      from: { pile: "tableau", index: 0 },
    })

    const result = applyKlondikeMove(state, move as NonNullable<typeof move>)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.tableau[0]).toEqual([
        card("hidden", "club", 4, true),
      ])
      expect(result.state.foundations[0]).toEqual([
        card("f1", "heart", 1, true),
        card("top", "heart", 2, true),
      ])
    }
  })

  it("marks the game won when the final foundation card is played", () => {
    function fullSuit(suit: KlondikeCard["suit"]): KlondikeCard[] {
      return Array.from({ length: 13 }, (_, index) =>
        card(`${suit}-${index}`, suit, index + 1, true),
      )
    }

    const state = baseState({
      status: "playing",
      foundations: [
        fullSuit("club"),
        fullSuit("diamond"),
        fullSuit("heart"),
        fullSuit("spade").slice(0, 12),
      ],
      waste: [card("last", "spade", 13, true)],
    })

    const result = applyKlondikeMove(state, {
      type: "auto-foundation",
      from: { pile: "waste" },
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.status).toBe("won")
    }
  })
})

describe("isKlondikeAutoCompleteReady", () => {
  it("is false when stock still has cards", () => {
    const state = baseState({
      stock: [card("s1", "club", 5, false)],
      tableau: [[card("t1", "heart", 1, true)], [], [], [], [], [], []],
    })

    expect(isKlondikeAutoCompleteReady(state)).toBe(false)
  })

  it("is false when a tableau card is face down", () => {
    const state = baseState({
      tableau: [
        [card("hidden", "club", 4, false), card("top", "heart", 2, true)],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    })

    expect(isKlondikeAutoCompleteReady(state)).toBe(false)
  })

  it("is true when stock is empty and every tableau card is face up", () => {
    const state = baseState({
      waste: [card("w1", "spade", 13, true)],
      foundations: [[card("f1", "heart", 1, true)]],
      tableau: [
        [card("t1", "heart", 2, true)],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    })

    expect(isKlondikeAutoCompleteReady(state)).toBe(true)
  })
})

describe("getKlondikeNextAutoCompleteMove", () => {
  it("picks the lowest rank card that can move to foundation", () => {
    const state = baseState({
      foundations: [
        [card("f1", "heart", 1, true)],
        [card("f2", "club", 1, true)],
      ],
      waste: [card("w1", "diamond", 3, true)],
      tableau: [
        [card("t1", "heart", 2, true)],
        [card("t2", "club", 2, true)],
        [],
        [],
        [],
        [],
        [],
      ],
    })

    const next = getKlondikeNextAutoCompleteMove(state)

    expect(next?.card.rank).toBe(2)
    expect(next?.move).toEqual({
      type: "auto-foundation",
      from: { pile: "tableau", index: 0 },
    })
  })
})
