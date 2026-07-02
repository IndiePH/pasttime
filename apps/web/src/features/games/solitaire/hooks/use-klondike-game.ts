"use client"

import * as React from "react"

import {
  applyKlondikeMove,
  createKlondikeGame,
  getKlondikeAutoFoundationMove,
  getKlondikeNextAutoFoundationMove,
  getKlondikeNextAutoFoundationMoveBatch,
  isKlondikeAutoCompleteReady,
  type KlondikeMove,
  type KlondikePileRef,
  type KlondikeState,
  type KlondikeTableauIndex,
} from "@pasttime/domain/games/solitaire"
import { useStorage } from "@/infrastructure/storage"
import { useKlondikeFoundationFly } from "@/features/games/solitaire/hooks/use-klondike-foundation-fly"
import { useSolitairePlayPreferencesContext } from "@/features/games/solitaire/context/solitaire-play-preferences-context"
import { waitForNextPaint } from "@/features/games/solitaire/lib/klondike-pile-geometry"

export interface KlondikeSelection {
  from: KlondikePileRef
  cardCount: number
}

const STORAGE_KEY = "solitaire:klondike:session"

type FoundationFlyQueueMode = "auto-stack" | "auto-complete" | null

function isKlondikeState(
  value: unknown,
  expectedDrawCount?: 1 | 3,
): value is KlondikeState {
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
    typeof record.moves === "number" &&
    (record.drawCount === 1 || record.drawCount === 3) &&
    (expectedDrawCount === undefined || record.drawCount === expectedDrawCount)
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

function applyUserMove(
  state: KlondikeState,
  move: KlondikeMove,
): { state: KlondikeState; feedback: string | null; ok: boolean } {
  const result = applyKlondikeMove(state, move)
  if (!result.ok) {
    return { state, feedback: null, ok: false }
  }

  let feedback: string | null = null

  if (move.type === "draw" && result.ok) {
    const cardsDrawn = result.state.waste.length - state.waste.length
    if (cardsDrawn > 0) {
      feedback = cardsDrawn === 1 ? "Drew 1 card" : `Drew ${cardsDrawn} cards`
    }
  }

  if (result.state.status === "won") {
    feedback = "You won!"
  }

  return { state: result.state, feedback, ok: true }
}

function shouldQueueAutoStack(
  nextState: KlondikeState,
  autoStackEnabled: boolean,
): boolean {
  return (
    autoStackEnabled &&
    nextState.status === "playing" &&
    !isKlondikeAutoCompleteReady(nextState) &&
    getKlondikeNextAutoFoundationMove(nextState) !== null
  )
}

export function useKlondikeGame(drawCount: 1 | 3) {
  const storage = useStorage()
  const { autoStackEnabled } = useSolitairePlayPreferencesContext()
  const initialState = React.useMemo(() => {
    const stored = storage.get<unknown>(STORAGE_KEY)
    if (isKlondikeState(stored, drawCount)) {
      return stored
    }
    return createKlondikeGame({ drawCount })
  }, [storage, drawCount])
  const [state, setState] = React.useState<KlondikeState>(initialState)
  const stateRef = React.useRef(state)
  const foundationFlyModeRef = React.useRef<FoundationFlyQueueMode>(null)
  const [selection, setSelection] = React.useState<KlondikeSelection | null>(
    null,
  )
  const [feedback, setFeedback] = React.useState<string | null>(null)

  React.useLayoutEffect(() => {
    stateRef.current = state
  }, [state])

  React.useEffect(() => {
    storage.set(STORAGE_KEY, state)
  }, [state, storage])

  const isPlaying = state.status === "playing"

  const clearSelection = React.useCallback(() => {
    setSelection(null)
  }, [])

  const applyMovesOnly = React.useCallback((moves: KlondikeMove[]) => {
    if (moves.length === 0) {
      return
    }

    let feedback: string | null = null

    setState((current) => {
      let nextState = current
      let fb: string | null = null

      for (const move of moves) {
        const next = applyUserMove(nextState, move)
        if (!next.ok) {
          break
        }

        nextState = next.state
        if (next.feedback) {
          fb = next.feedback
        }
      }

      feedback = fb
      return nextState
    })

    if (feedback !== null) {
      setFeedback(feedback)
    }
    setSelection(null)
  }, [])

  const clearFoundationFlyMode = React.useCallback(() => {
    foundationFlyModeRef.current = null
  }, [])

  const handleFoundationFlyFinished = React.useCallback(
    (finalState: KlondikeState) => {
      clearFoundationFlyMode()
      if (finalState.status === "won") {
        setFeedback("You won!")
      }
    },
    [clearFoundationFlyMode],
  )

  const foundationFlyQueue = useKlondikeFoundationFly({
    state,
    getNextBatch: getKlondikeNextAutoFoundationMoveBatch,
    applyMoves: applyMovesOnly,
    onFinished: handleFoundationFlyFinished,
  })

  const {
    isActive: foundationFlyActive,
    flySessions: foundationFlyFlySessions,
    startQueue: startFoundationFlyQueue,
    cancelQueue: cancelFoundationFlyQueue,
    hiddenCardIds: foundationFlyHiddenCardIds,
    flyDurationMs: foundationFlyFlyDurationMs,
    handleFlyComplete: foundationFlyHandleFlyComplete,
    handleFlyMeasureFailed: foundationFlyHandleFlyMeasureFailed,
  } = foundationFlyQueue

  const applyAndUpdate = React.useCallback((move: KlondikeMove) => {
    const next = applyUserMove(stateRef.current, move)
    if (!next.ok) {
      return
    }

    setFeedback(next.feedback)
    setState(next.state)
    setSelection(null)
  }, [])

  React.useEffect(() => {
    if (
      !isPlaying ||
      foundationFlyActive ||
      foundationFlyFlySessions.length > 0
    ) {
      return
    }

    const autoCompleteReady = isKlondikeAutoCompleteReady(state)
    const shouldAutoStack = shouldQueueAutoStack(state, autoStackEnabled)

    if (!autoCompleteReady && !shouldAutoStack) {
      return
    }

    foundationFlyModeRef.current = autoCompleteReady
      ? "auto-complete"
      : "auto-stack"

    void waitForNextPaint().then(() => {
      startFoundationFlyQueue()
    })
  }, [
    autoStackEnabled,
    foundationFlyActive,
    foundationFlyFlySessions.length,
    isPlaying,
    startFoundationFlyQueue,
    state,
  ])

  React.useEffect(() => {
    if (foundationFlyModeRef.current !== "auto-complete") {
      return
    }

    if (state.stock.length > 0) {
      cancelFoundationFlyQueue()
      clearFoundationFlyMode()
    }
  }, [
    cancelFoundationFlyQueue,
    clearFoundationFlyMode,
    state.stock.length,
  ])

  const foundationFly = {
    isAutoCompleting: foundationFlyActive,
    flySessions: foundationFlyFlySessions,
    hiddenCardIds: foundationFlyHiddenCardIds,
    flyDurationMs: foundationFlyFlyDurationMs,
    handleFlyComplete: foundationFlyHandleFlyComplete,
    handleFlyMeasureFailed: foundationFlyHandleFlyMeasureFailed,
  }

  const interactionEnabled = isPlaying && !foundationFlyActive

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

      const next = applyUserMove(stateRef.current, move)
      if (!next.ok) {
        return false
      }

      setFeedback(next.feedback)
      setState(next.state)
      setSelection(null)

      return true
    },
    [interactionEnabled],
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
    cancelFoundationFlyQueue()
    clearFoundationFlyMode()
    setState(createKlondikeGame({ drawCount }))
    setSelection(null)
    setFeedback(null)
  }, [cancelFoundationFlyQueue, clearFoundationFlyMode, drawCount])

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
    foundationFly,
  }
}
