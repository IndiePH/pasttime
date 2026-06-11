"use client"

import * as React from "react"

import type {
  KlondikeCard,
  KlondikeFoundationIndex,
  KlondikePileRef,
  KlondikeState,
  KlondikeTableauIndex,
} from "@pasttime/domain/games/solitaire"

const DRAG_THRESHOLD_PX = 8
const DROP_TARGET_ATTR = "data-klondike-drop"

export interface KlondikeDragSession {
  from: KlondikePileRef
  cardCount: number
  cards: KlondikeCard[]
  x: number
  y: number
  cardWidthPx: number
  cardHeightPx: number
  stackStepPx: number
}

interface KlondikeCardMetrics {
  cardWidthPx: number
  cardHeightPx: number
  stackStepPx: number
}

function readKlondikeCardMetrics(element: Element): KlondikeCardMetrics {
  const rect = element.getBoundingClientRect()
  const board = element.closest(".klondike-board")
  const stackStepRaw = board
    ? getComputedStyle(board).getPropertyValue("--game-stack-step")
    : ""
  const stackStepPx = Number.parseFloat(stackStepRaw) || rect.width * 0.32

  return {
    cardWidthPx: rect.width,
    cardHeightPx: rect.height,
    stackStepPx,
  }
}

interface UseKlondikeDragOptions {
  enabled: boolean
  state: KlondikeState
  selectFrom: (from: KlondikePileRef, cardCount: number) => void
  moveCards: (
    from: KlondikePileRef,
    cardCount: number,
    to: KlondikePileRef,
  ) => boolean
  clearSelection: () => void
}

function getPileCards(
  state: KlondikeState,
  from: KlondikePileRef,
): KlondikeCard[] {
  switch (from.pile) {
    case "stock":
      return state.stock
    case "waste":
      return state.waste
    case "foundation":
      return state.foundations[from.index]
    case "tableau":
      return state.tableau[from.index]
  }
}

function parseDropTarget(value: string | null): KlondikePileRef | null {
  if (!value) {
    return null
  }

  if (value.startsWith("foundation-")) {
    const index = Number(value.slice("foundation-".length))
    if (index >= 0 && index <= 3) {
      return { pile: "foundation", index: index as KlondikeFoundationIndex }
    }
    return null
  }

  if (value.startsWith("tableau-")) {
    const index = Number(value.slice("tableau-".length))
    if (index >= 0 && index <= 6) {
      return { pile: "tableau", index: index as KlondikeTableauIndex }
    }
  }

  return null
}

function resolveDropTarget(clientX: number, clientY: number): KlondikePileRef | null {
  const element = document.elementFromPoint(clientX, clientY)
  const dropTarget = element?.closest(`[${DROP_TARGET_ATTR}]`)
  if (!dropTarget) {
    return null
  }

  return parseDropTarget(dropTarget.getAttribute(DROP_TARGET_ATTR))
}

export function useKlondikeDrag({
  enabled,
  state,
  selectFrom,
  moveCards,
  clearSelection,
}: UseKlondikeDragOptions) {
  const [dragSession, setDragSession] = React.useState<KlondikeDragSession | null>(
    null,
  )
  const [hoverDropId, setHoverDropId] = React.useState<string | null>(null)
  const stateRef = React.useRef(state)
  const pendingRef = React.useRef<{
    from: KlondikePileRef
    cardCount: number
    startX: number
    startY: number
    pointerId: number
    cardWidthPx: number
    cardHeightPx: number
    stackStepPx: number
  } | null>(null)
  const isDraggingRef = React.useRef(false)
  const suppressClickRef = React.useRef(false)

  React.useEffect(() => {
    stateRef.current = state
  }, [state])

  const endDrag = React.useCallback(
    (clientX: number, clientY: number) => {
      const pending = pendingRef.current
      const didDrag = isDraggingRef.current

      if (didDrag && pending) {
        const { from, cardCount } = pending
        const dropTarget = resolveDropTarget(clientX, clientY)
        if (dropTarget) {
          const moved = moveCards(from, cardCount, dropTarget)
          if (!moved) {
            clearSelection()
          }
        } else {
          clearSelection()
        }
        suppressClickRef.current = true
      }

      pendingRef.current = null
      isDraggingRef.current = false
      setDragSession(null)
      setHoverDropId(null)
    },
    [clearSelection, moveCards],
  )

  React.useEffect(() => {
    if (!enabled) {
      return
    }

    function handlePointerMove(event: PointerEvent) {
      const pending = pendingRef.current
      if (!pending || event.pointerId !== pending.pointerId) {
        return
      }

      const deltaX = event.clientX - pending.startX
      const deltaY = event.clientY - pending.startY
      const distance = Math.hypot(deltaX, deltaY)

      if (!isDraggingRef.current && distance < DRAG_THRESHOLD_PX) {
        return
      }

      if (!isDraggingRef.current) {
        isDraggingRef.current = true
        selectFrom(pending.from, pending.cardCount)
        const pile = getPileCards(stateRef.current, pending.from)
        const cards = pile.slice(pile.length - pending.cardCount)
        setDragSession({
          from: pending.from,
          cardCount: pending.cardCount,
          cards,
          x: event.clientX,
          y: event.clientY,
          cardWidthPx: pending.cardWidthPx,
          cardHeightPx: pending.cardHeightPx,
          stackStepPx: pending.stackStepPx,
        })
        return
      }

      setDragSession((current) =>
        current
          ? { ...current, x: event.clientX, y: event.clientY }
          : current,
      )

      const dropElement = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest(`[${DROP_TARGET_ATTR}]`)
      setHoverDropId(dropElement?.getAttribute(DROP_TARGET_ATTR) ?? null)
    }

    function handlePointerEnd(event: PointerEvent) {
      const pending = pendingRef.current
      if (!pending || event.pointerId !== pending.pointerId) {
        return
      }

      endDrag(event.clientX, event.clientY)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerEnd)
    window.addEventListener("pointercancel", handlePointerEnd)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerEnd)
      window.removeEventListener("pointercancel", handlePointerEnd)
    }
  }, [enabled, endDrag, selectFrom])

  const getDragSourceProps = React.useCallback(
    (from: KlondikePileRef, cardCount: number) => {
      if (!enabled) {
        return {}
      }

      return {
        onPointerDown: (event: React.PointerEvent) => {
          if (event.button !== 0) {
            return
          }

          const metrics = readKlondikeCardMetrics(event.currentTarget)
          pendingRef.current = {
            from,
            cardCount,
            startX: event.clientX,
            startY: event.clientY,
            pointerId: event.pointerId,
            ...metrics,
          }
          event.currentTarget.setPointerCapture(event.pointerId)
        },
      }
    },
    [enabled],
  )

  const getDropTargetProps = React.useCallback(
    (dropId: string) => ({
      [DROP_TARGET_ATTR]: dropId,
      "data-drop-active": hoverDropId === dropId ? "true" : undefined,
    }),
    [hoverDropId],
  )

  const consumeSuppressedClick = React.useCallback(() => {
    if (!suppressClickRef.current) {
      return false
    }

    suppressClickRef.current = false
    return true
  }, [])

  const isDragSourceHidden = React.useCallback(
    (from: KlondikePileRef, cardIndex?: number) => {
      if (!dragSession) {
        return false
      }

      if (dragSession.from.pile !== from.pile) {
        return false
      }

      if (
        from.pile === "tableau" &&
        dragSession.from.pile === "tableau" &&
        from.index !== dragSession.from.index
      ) {
        return false
      }

      if (from.pile === "waste") {
        return true
      }

      if (from.pile === "tableau" && cardIndex !== undefined) {
        const column = state.tableau[from.index]
        const hiddenFromIndex = column.length - dragSession.cardCount
        return cardIndex >= hiddenFromIndex
      }

      return false
    },
    [dragSession, state.tableau],
  )

  return {
    dragSession,
    getDragSourceProps,
    getDropTargetProps,
    consumeSuppressedClick,
    isDragSourceHidden,
    isDragging: dragSession !== null,
  }
}

export function klondikeDropId(ref: KlondikePileRef): string | null {
  if (ref.pile === "foundation") {
    return `foundation-${ref.index}`
  }
  if (ref.pile === "tableau") {
    return `tableau-${ref.index}`
  }
  return null
}
