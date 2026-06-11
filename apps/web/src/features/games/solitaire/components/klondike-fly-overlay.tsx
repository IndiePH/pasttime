"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { useTheme } from "@/components/theme-provider"
import { useSolitairePlayPreferencesContext } from "@/features/games/solitaire/context/solitaire-play-preferences-context"
import { PlayingCard } from "@/features/games/solitaire/components/playing-card"
import {
  getKlondikeFoundationRect,
  getKlondikePileRect,
  waitForNextPaint,
} from "@/features/games/solitaire/lib/klondike-pile-geometry"
import type { PlayingCardVariant } from "@pasttime/domain/games"
import type {
  KlondikeCard,
  KlondikeFoundationIndex,
  KlondikeMove,
} from "@pasttime/domain/games/solitaire"

export interface KlondikeFlySession {
  card: KlondikeCard
  move: KlondikeMove
  foundationIndex: KlondikeFoundationIndex
}

interface KlondikeFlyOverlayProps {
  sessions: readonly KlondikeFlySession[]
  durationMs: number
  onComplete: () => void
  onMeasureFailed: () => void
}

interface KlondikeFlyingCardProps {
  session: KlondikeFlySession
  durationMs: number
  cardVariant: PlayingCardVariant
  backVariant: "light" | "dark"
  onComplete: (cardId: string) => void
  onMeasureFailed: (cardId: string) => void
}

const MAX_MEASURE_ATTEMPTS = 8

function flyTransform(x: number, y: number): string {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
}

function KlondikeFlyingCard({
  session,
  durationMs,
  cardVariant,
  backVariant,
  onComplete,
  onMeasureFailed,
}: KlondikeFlyingCardProps) {
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const onCompleteRef = React.useRef(onComplete)
  const onMeasureFailedRef = React.useRef(onMeasureFailed)

  React.useLayoutEffect(() => {
    onCompleteRef.current = onComplete
    onMeasureFailedRef.current = onMeasureFailed
  }, [onComplete, onMeasureFailed])

  React.useLayoutEffect(() => {
    const node = nodeRef.current
    if (!node) {
      return
    }

    if (session.move.type !== "auto-foundation") {
      onMeasureFailedRef.current(session.card.id)
      return
    }

    const moveFrom = session.move.from
    const foundationIndex = session.foundationIndex
    const flyNode = node
    const cardId = session.card.id

    let cancelled = false
    let animation: Animation | null = null
    let attempt = 0

    async function runFly() {
      while (attempt < MAX_MEASURE_ATTEMPTS && !cancelled) {
        await waitForNextPaint()

        const from = getKlondikePileRect(moveFrom)
        const to = getKlondikeFoundationRect(foundationIndex)

        if (!from || !to) {
          attempt += 1
          continue
        }

        const distance = Math.hypot(to.x - from.x, to.y - from.y)
        if (distance < 4) {
          attempt += 1
          continue
        }

        flyNode.style.width = `${from.width}px`
        flyNode.style.height = `${from.height}px`
        flyNode.style.transform = flyTransform(from.x, from.y)

        await waitForNextPaint()

        if (cancelled) {
          return
        }

        animation = flyNode.animate(
          [
            { transform: flyTransform(from.x, from.y) },
            { transform: flyTransform(to.x, to.y) },
          ],
          {
            duration: durationMs,
            easing: "ease-in-out",
            fill: "forwards",
          },
        )

        animation.addEventListener("finish", handleFinish)
        return
      }

      if (!cancelled) {
        onMeasureFailedRef.current(cardId)
      }
    }

    function handleFinish() {
      if (!cancelled) {
        onCompleteRef.current(cardId)
      }
    }

    void runFly()

    return () => {
      cancelled = true
      if (animation) {
        animation.removeEventListener("finish", handleFinish)
        animation.cancel()
      }
    }
  }, [durationMs, session])

  return (
    <div
      ref={nodeRef}
      className="pointer-events-none fixed left-0 top-0 z-[200] will-change-transform"
      style={{
        width: "var(--game-card-w, 4rem)",
        height: "calc(var(--game-card-w, 4rem) * 4 / 3)",
        transform: "translate3d(-9999px, -9999px, 0)",
      }}
      aria-hidden
    >
      <PlayingCard
        card={session.card}
        variant={cardVariant}
        backVariant={backVariant}
        className="aspect-auto h-full w-full shadow-lg ring-2 ring-primary/40"
      />
    </div>
  )
}

export function KlondikeFlyOverlay({
  sessions,
  durationMs,
  onComplete,
  onMeasureFailed,
}: KlondikeFlyOverlayProps) {
  const { resolvedTheme } = useTheme()
  const { cardVariant } = useSolitairePlayPreferencesContext()
  const backVariant = resolvedTheme === "dark" ? "light" : "dark"
  const onCompleteRef = React.useRef(onComplete)
  const onMeasureFailedRef = React.useRef(onMeasureFailed)
  const completedIdsRef = React.useRef<Set<string>>(new Set())
  const failedRef = React.useRef(false)
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  React.useLayoutEffect(() => {
    onCompleteRef.current = onComplete
    onMeasureFailedRef.current = onMeasureFailed
  }, [onComplete, onMeasureFailed])

  React.useEffect(() => {
    completedIdsRef.current = new Set()
    failedRef.current = false
  }, [sessions])

  const handleCardComplete = React.useCallback(
    (cardId: string) => {
      if (failedRef.current) {
        return
      }

      completedIdsRef.current.add(cardId)
      if (completedIdsRef.current.size >= sessions.length) {
        onCompleteRef.current()
      }
    },
    [sessions.length],
  )

  const handleCardMeasureFailed = React.useCallback(
    (cardId: string) => {
      if (failedRef.current) {
        return
      }

      failedRef.current = true
      completedIdsRef.current.delete(cardId)
      onMeasureFailedRef.current()
    },
    [],
  )

  if (!isMounted || sessions.length === 0) {
    return null
  }

  return createPortal(
    <>
      {sessions.map((session) => (
        <KlondikeFlyingCard
          key={session.card.id}
          session={session}
          durationMs={durationMs}
          cardVariant={cardVariant}
          backVariant={backVariant}
          onComplete={handleCardComplete}
          onMeasureFailed={handleCardMeasureFailed}
        />
      ))}
    </>,
    document.body,
  )
}
