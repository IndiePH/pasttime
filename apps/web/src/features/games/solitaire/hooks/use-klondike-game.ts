"use client"

import * as React from "react"

import {
  applyKlondikeMove,
  createKlondikeGame,
  getKlondikeAutoFoundationMove,
  type KlondikeMove,
  type KlondikePileRef,
  type KlondikeState,
  type KlondikeTableauIndex,
} from "@pasttime/domain/games/solitaire"
import { useStorage } from "@/infrastructure/storage"
import { useKlondikeAutoComplete } from "@/features/games/solitaire/hooks/use-klondike-auto-complete"

export interface KlondikeSelection {
  from: KlondikePileRef
  cardCount: number
}

const STORAGE_KEY = "solitaire:klondike:session"

function isKlondikeState(value: unknown): value is KlondikeState {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    Array.isArray(record.stock) &&
    Array.isArray(record.waste) &&
    Array.isArray(record.foundations) &&
    Array.isArray(record.tableau) &&
    (record.status === "playing" || record.status === "won") &&
    typeof record.moves === "number"
  )
}

function pileKey(ref: KlondikePileRef): string {
  if (ref.pile === "foundation") {
    return `foundation:${ref.index}`
  }
  if (ref.pile === "tableau") {
    return `tableau:${ref.index}`
  }
  return ref.pile
}

function isSameSelectionSource(
  a: KlondikeSelection,
  b: KlondikePileRef,
): boolean {
  return pileKey(a.from) === pileKey(b)
}

function tryMove(
  state: KlondikeState,
  move: KlondikeMove,
): { state: KlondikeState; feedback: string | null } {
  const result = applyKlondikeMove(state, move)
  if (!result.ok) {
    return { state, feedback: null }
  }

  if (result.state.status === "won") {
    return { state: result.state, feedback: "You won!" }
  }

  return { state: result.state, feedback: null }
}

export function useKlondikeGame() {
  const storage = useStorage()
  const initialState = React.useMemo(() => {
    const stored = storage.get<unknown>(STORAGE_KEY)
    return isKlondikeState(stored) ? stored : createKlondikeGame()
  }, [storage])
  const [state, setState] = React.useState<KlondikeState>(initialState)
  const [selection, setSelection] = React.useState<KlondikeSelection | null>(
    null,
  )
  const [feedback, setFeedback] = React.useState<string | null>(null)

  React.useEffect(() => {
    storage.set(STORAGE_KEY, state)
  }, [state, storage])

  const isPlaying = state.status === "playing"

  const clearSelection = React.useCallback(() => {
    setSelection(null)
  }, [])

  const applyAndUpdate = React.useCallback((move: KlondikeMove) => {
    setState((current) => {
      const next = tryMove(current, move)
      setFeedback(next.feedback)
      return next.state
    })
    setSelection(null)
  }, [])

  const handleAutoCompleteFinished = React.useCallback(() => {
    setFeedback("You won!")
  }, [])

  const autoComplete = useKlondikeAutoComplete({
    state,
    isPlaying,
    applyMove: applyAndUpdate,
    onComplete: handleAutoCompleteFinished,
  })

  const interactionEnabled =
    isPlaying && !autoComplete.isAutoCompleting

  const drawOrRecycle = React.useCallback(() => {
    if (!interactionEnabled) {
      return
    }

    if (state.stock.length > 0) {
      applyAndUpdate({ type: "draw" })
      return
    }

    if (state.waste.length > 0) {
      applyAndUpdate({ type: "recycle" })
    }
  }, [
    applyAndUpdate,
    interactionEnabled,
    state.stock.length,
    state.waste.length,
  ])

  const autoFoundation = React.useCallback(
    (from: KlondikePileRef) => {
      if (!interactionEnabled) {
        return
      }

      const move = getKlondikeAutoFoundationMove(state, from)
      if (move) {
        applyAndUpdate(move)
      }
    },
    [applyAndUpdate, interactionEnabled, state],
  )

  const selectFrom = React.useCallback(
    (from: KlondikePileRef, cardCount: number) => {
      if (!interactionEnabled || cardCount < 1) {
        return
      }

      setSelection({ from, cardCount })
      setFeedback(null)
    },
    [interactionEnabled],
  )

  const moveCards = React.useCallback(
    (from: KlondikePileRef, cardCount: number, to: KlondikePileRef) => {
      if (!interactionEnabled || cardCount < 1) {
        return false
      }

      const move: KlondikeMove = {
        type: "move",
        from,
        cardCount,
        to,
      }

      const result = applyKlondikeMove(state, move)
      if (!result.ok) {
        return false
      }

      setState(result.state)
      setSelection(null)
      setFeedback(result.state.status === "won" ? "You won!" : null)
      return true
    },
    [interactionEnabled, state],
  )

  const attemptMoveTo = React.useCallback(
    (to: KlondikePileRef) => {
      if (!selection || !interactionEnabled) {
        return false
      }

      return moveCards(selection.from, selection.cardCount, to)
    },
    [interactionEnabled, moveCards, selection],
  )

  const handleTableauCardClick = React.useCallback(
    (columnIndex: number, cardIndex: number) => {
      const column = state.tableau[columnIndex]
      const card = column[cardIndex]
      if (!card?.faceUp) {
        return
      }

      const from: KlondikePileRef = {
        pile: "tableau",
        index: columnIndex as KlondikeTableauIndex,
      }
      const cardCount = column.length - cardIndex

      if (selection && isSameSelectionSource(selection, from)) {
        if (selection.cardCount === cardCount) {
          clearSelection()
          return
        }
      }

      if (selection) {
        const moved = attemptMoveTo(from)
        if (moved) {
          return
        }
      }

      selectFrom(from, cardCount)
    },
    [attemptMoveTo, clearSelection, selectFrom, selection, state.tableau],
  )

  const handleWasteClick = React.useCallback(() => {
    const from: KlondikePileRef = { pile: "waste" }
    if (!state.waste.length) {
      return
    }

    if (selection) {
      if (isSameSelectionSource(selection, from)) {
        clearSelection()
        return
      }

      const moved = attemptMoveTo(from)
      if (moved) {
        return
      }
    }

    selectFrom(from, 1)
  }, [attemptMoveTo, clearSelection, selectFrom, selection, state.waste.length])

  const handleFoundationClick = React.useCallback(
    (index: KlondikePileRef & { pile: "foundation" }) => {
      if (!selection) {
        return
      }

      attemptMoveTo(index)
    },
    [attemptMoveTo, selection],
  )

  const handleEmptyTableauClick = React.useCallback(
    (columnIndex: number) => {
      if (!selection) {
        return
      }

      attemptMoveTo({
        pile: "tableau",
        index: columnIndex as KlondikeTableauIndex,
      })
    },
    [attemptMoveTo, selection],
  )

  const newGame = React.useCallback(() => {
    setState(createKlondikeGame())
    setSelection(null)
    setFeedback(null)
  }, [])

  return {
    state,
    selection,
    feedback,
    isPlaying,
    drawOrRecycle,
    autoFoundation,
    handleTableauCardClick,
    handleWasteClick,
    handleFoundationClick,
    handleEmptyTableauClick,
    moveCards,
    selectFrom,
    clearSelection,
    newGame,
    autoComplete,
  }
}
