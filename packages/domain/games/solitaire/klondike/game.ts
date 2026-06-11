import { dealKlondikeState } from "./deal"
import {
  canPlaceOnFoundation,
  canPlaceOnTableau,
  canStackOnTableau,
} from "./rules"
import type {
  KlondikeCard,
  KlondikeFoundationIndex,
  KlondikeMove,
  KlondikeMoveRejectReason,
  KlondikeMoveResult,
  KlondikePileRef,
  KlondikeState,
  KlondikeTableauIndex,
} from "./types"

export interface KlondikeAutoCompleteMove {
  move: KlondikeMove
  from: KlondikePileRef
  card: KlondikeCard
  foundationIndex: KlondikeFoundationIndex
}

interface CreateKlondikeGameOptions {
  seed?: number | null
}

function cloneState(state: KlondikeState): KlondikeState {
  return {
    ...state,
    stock: [...state.stock],
    waste: [...state.waste],
    foundations: state.foundations.map((pile) => [...pile]) as KlondikeState["foundations"],
    tableau: state.tableau.map((column) => [...column]) as KlondikeState["tableau"],
  }
}

function withMove(state: KlondikeState): KlondikeState {
  return {
    ...state,
    moves: state.moves + 1,
  }
}

function isWon(state: KlondikeState): boolean {
  return state.foundations.every((pile) => pile.length === 13)
}

function finalizeState(state: KlondikeState): KlondikeState {
  return {
    ...state,
    status: isWon(state) ? "won" : state.status,
  }
}

function reject(
  reason: KlondikeMoveRejectReason,
): KlondikeMoveResult {
  return { ok: false, reason }
}

function getPileCards(
  state: KlondikeState,
  ref: KlondikePileRef,
): KlondikeCard[] {
  switch (ref.pile) {
    case "stock":
      return state.stock
    case "waste":
      return state.waste
    case "foundation":
      return state.foundations[ref.index]
    case "tableau":
      return state.tableau[ref.index]
  }
}

function pileRefKey(ref: KlondikePileRef): string {
  if (ref.pile === "foundation") {
    return `foundation:${ref.index}`
  }
  if (ref.pile === "tableau") {
    return `tableau:${ref.index}`
  }
  return ref.pile
}

function isSamePile(a: KlondikePileRef, b: KlondikePileRef): boolean {
  return pileRefKey(a) === pileRefKey(b)
}

function flipTopTableauCard(state: KlondikeState, index: number): void {
  const column = state.tableau[index]
  const top = column[column.length - 1]
  if (top && !top.faceUp) {
    top.faceUp = true
  }
}

function removeCards(
  state: KlondikeState,
  from: KlondikePileRef,
  cardCount: number,
): KlondikeCard[] {
  const pile = getPileCards(state, from)
  if (cardCount < 1 || cardCount > pile.length) {
    return []
  }

  return pile.splice(pile.length - cardCount, cardCount)
}

function appendCards(
  state: KlondikeState,
  to: KlondikePileRef,
  cards: KlondikeCard[],
): void {
  const pile = getPileCards(state, to)
  pile.push(...cards)
}

export function createKlondikeGame(
  options: CreateKlondikeGameOptions = {},
): KlondikeState {
  const seed = options.seed ?? null
  return dealKlondikeState(seed)
}

export function canApplyKlondikeMove(
  state: KlondikeState,
  move: KlondikeMove,
): boolean {
  return applyKlondikeMove(state, move).ok
}

export function applyKlondikeMove(
  state: KlondikeState,
  move: KlondikeMove,
): KlondikeMoveResult {
  if (state.status === "won") {
    return reject("game-complete")
  }

  const next = cloneState(state)

  if (move.type === "draw") {
    if (next.stock.length === 0) {
      return reject("empty-stock")
    }

    const drawn = next.stock.pop()
    if (!drawn) {
      return reject("empty-stock")
    }

    next.waste.push({ ...drawn, faceUp: true })
    return { ok: true, state: finalizeState(withMove(next)) }
  }

  if (move.type === "recycle") {
    if (next.stock.length > 0) {
      return reject("stock-not-empty")
    }
    if (next.waste.length === 0) {
      return reject("nothing-to-recycle")
    }

    next.stock = [...next.waste].reverse().map((card) => ({
      ...card,
      faceUp: false,
    }))
    next.waste = []
    return { ok: true, state: finalizeState(withMove(next)) }
  }

  if (move.type === "auto-foundation") {
    const pile = getPileCards(next, move.from)
    const card = pile[pile.length - 1]
    if (!card) {
      return reject("invalid-move")
    }

    const foundationIndex = next.foundations.findIndex((foundation) =>
      canPlaceOnFoundation(card, foundation),
    )
    if (foundationIndex < 0) {
      return reject("invalid-move")
    }

    pile.pop()
    next.foundations[foundationIndex]?.push(card)

    if (move.from.pile === "tableau") {
      flipTopTableauCard(next, move.from.index)
    }

    return {
      ok: true,
      state: finalizeState(withMove({ ...next, status: "playing" })),
    }
  }

  const { from, to, cardCount } = move
  if (isSamePile(from, to)) {
    return reject("invalid-move")
  }

  const sourcePile = getPileCards(next, from)
  if (cardCount < 1 || cardCount > sourcePile.length) {
    return reject("invalid-move")
  }

  const movingCards = sourcePile.slice(sourcePile.length - cardCount)
  const bottomCard = movingCards[0]
  if (!bottomCard?.faceUp) {
    return reject("invalid-move")
  }

  if (from.pile === "waste" && cardCount !== 1) {
    return reject("invalid-move")
  }

  if (from.pile === "foundation") {
    return reject("invalid-move")
  }

  if (to.pile === "stock" || to.pile === "waste") {
    return reject("invalid-move")
  }

  if (to.pile === "foundation") {
    if (cardCount !== 1) {
      return reject("invalid-move")
    }

    const foundation = next.foundations[to.index]
    if (!canPlaceOnFoundation(bottomCard, foundation)) {
      return reject("invalid-move")
    }
  }

  if (to.pile === "tableau") {
    const column = next.tableau[to.index]
    if (!canStackOnTableau(movingCards, column)) {
      return reject("invalid-move")
    }
  }

  const removed = removeCards(next, from, cardCount)
  if (removed.length !== cardCount) {
    return reject("invalid-move")
  }

  appendCards(next, to, removed)

  if (from.pile === "tableau") {
    flipTopTableauCard(next, from.index)
  }

  return {
    ok: true,
    state: finalizeState(withMove({ ...next, status: "playing" })),
  }
}

export function isKlondikeAutoCompleteReady(state: KlondikeState): boolean {
  if (state.status === "won") {
    return false
  }

  if (state.stock.length > 0) {
    return false
  }

  return state.tableau.every((column) =>
    column.every((card) => card.faceUp),
  )
}

function getAutoFoundationTargetIndex(
  state: KlondikeState,
  from: KlondikePileRef,
): KlondikeFoundationIndex | null {
  const pile = getPileCards(state, from)
  const card = pile[pile.length - 1]
  if (!card) {
    return null
  }

  const foundationIndex = state.foundations.findIndex((foundation) =>
    canPlaceOnFoundation(card, foundation),
  )

  return foundationIndex >= 0
    ? (foundationIndex as KlondikeFoundationIndex)
    : null
}

function collectKlondikeAutoFoundationCandidates(
  state: KlondikeState,
): KlondikeAutoCompleteMove[] {
  const candidates: KlondikeAutoCompleteMove[] = []

  const wasteMove = getKlondikeAutoFoundationMove(state, { pile: "waste" })
  if (wasteMove) {
    const card = state.waste[state.waste.length - 1]
    const foundationIndex = getAutoFoundationTargetIndex(state, { pile: "waste" })
    if (card && foundationIndex !== null) {
      candidates.push({
        move: wasteMove,
        from: { pile: "waste" },
        card,
        foundationIndex,
      })
    }
  }

  for (let index = 0; index < state.tableau.length; index += 1) {
    const from: KlondikePileRef = {
      pile: "tableau",
      index: index as KlondikeTableauIndex,
    }
    const move = getKlondikeAutoFoundationMove(state, from)
    if (!move) {
      continue
    }

    const column = state.tableau[index]
    const card = column[column.length - 1]
    const foundationIndex = getAutoFoundationTargetIndex(state, from)
    if (card && foundationIndex !== null) {
      candidates.push({ move, from, card, foundationIndex })
    }
  }

  return candidates
}

function compareKlondikeAutoFoundationCandidates(
  left: KlondikeAutoCompleteMove,
  right: KlondikeAutoCompleteMove,
): number {
  const rankDiff = left.card.rank - right.card.rank
  if (rankDiff !== 0) {
    return rankDiff
  }

  if (left.from.pile === "waste" && right.from.pile !== "waste") {
    return -1
  }

  if (right.from.pile === "waste" && left.from.pile !== "waste") {
    return 1
  }

  if (left.from.pile === "tableau" && right.from.pile === "tableau") {
    return left.from.index - right.from.index
  }

  return 0
}

/** One move per foundation pile — parallel across suits, sequential by rank. */
export function getKlondikeNextAutoFoundationMoveBatch(
  state: KlondikeState,
): KlondikeAutoCompleteMove[] {
  const candidates = collectKlondikeAutoFoundationCandidates(state)
  if (candidates.length === 0) {
    return []
  }

  const byFoundation = new Map<
    KlondikeFoundationIndex,
    KlondikeAutoCompleteMove
  >()

  for (const candidate of candidates) {
    const existing = byFoundation.get(candidate.foundationIndex)
    if (
      !existing ||
      compareKlondikeAutoFoundationCandidates(candidate, existing) < 0
    ) {
      byFoundation.set(candidate.foundationIndex, candidate)
    }
  }

  const batch = [...byFoundation.values()]
  batch.sort(compareKlondikeAutoFoundationCandidates)
  return batch
}

export function getKlondikeNextAutoFoundationMove(
  state: KlondikeState,
): KlondikeAutoCompleteMove | null {
  return getKlondikeNextAutoFoundationMoveBatch(state)[0] ?? null
}

/** @deprecated Use getKlondikeNextAutoFoundationMove */
export const getKlondikeNextAutoStackMove = getKlondikeNextAutoFoundationMove

/** @deprecated Use getKlondikeNextAutoFoundationMove */
export const getKlondikeNextAutoCompleteMove = getKlondikeNextAutoFoundationMove

export function getKlondikeAutoFoundationMove(
  state: KlondikeState,
  from: KlondikePileRef,
): KlondikeMove | null {
  const pile = getPileCards(state, from)
  const card = pile[pile.length - 1]
  if (!card) {
    return null
  }

  const canAuto =
    from.pile === "waste" ||
    (from.pile === "tableau" && card.faceUp)

  if (!canAuto) {
    return null
  }

  const hasFoundation = state.foundations.some((foundation) =>
    canPlaceOnFoundation(card, foundation),
  )

  if (!hasFoundation) {
    return null
  }

  return { type: "auto-foundation", from }
}

export function applyKlondikeAutoStack(state: KlondikeState): KlondikeState {
  if (state.status === "won") {
    return state
  }

  let current = state
  let changed = true

  while (changed && current.status !== "won") {
    changed = false

    const batch = getKlondikeNextAutoFoundationMoveBatch(current)
    if (batch.length === 0) {
      continue
    }

    for (const next of batch) {
      const result = applyKlondikeMove(current, next.move)
      if (result.ok) {
        current = result.state
        changed = true
      }
    }
  }

  return current
}

export function isValidKlondikeTableauPlacement(
  movingCards: KlondikeCard[],
  column: KlondikeCard[],
): boolean {
  return canStackOnTableau(movingCards, column)
}

export function isValidKlondikeFoundationPlacement(
  card: KlondikeCard,
  foundation: KlondikeCard[],
): boolean {
  return canPlaceOnFoundation(card, foundation)
}

export function canPlaceOnKlondikeTableau(
  card: KlondikeCard,
  column: KlondikeCard[],
): boolean {
  return canPlaceOnTableau(card, column)
}
