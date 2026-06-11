"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { useTheme } from "@/components/theme-provider"
import { PlayingCard } from "@/features/games/solitaire/components/playing-card"
import type { KlondikePileRect } from "@/features/games/solitaire/lib/klondike-pile-geometry"
import type { KlondikeCard, KlondikeMove } from "@pasttime/domain/games/solitaire"

export interface KlondikeFlySession {
  card: KlondikeCard
  move: KlondikeMove
  from: KlondikePileRect
  to: KlondikePileRect
}

interface KlondikeFlyOverlayProps {
  session: KlondikeFlySession | null
  durationMs: number
  onComplete: () => void
}

export function KlondikeFlyOverlay({
  session,
  durationMs,
  onComplete,
}: KlondikeFlyOverlayProps) {
  const { resolvedTheme } = useTheme()
  const backVariant = resolvedTheme === "dark" ? "light" : "dark"
  const [animating, setAnimating] = React.useState(false)
  const completedRef = React.useRef(false)
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  React.useLayoutEffect(() => {
    if (!session) {
      setAnimating(false)
      completedRef.current = false
      return
    }

    completedRef.current = false
    setAnimating(false)
    const frame = requestAnimationFrame(() => {
      setAnimating(true)
    })

    let timeoutId: number | undefined
    if (durationMs > 0) {
      timeoutId = window.setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true
          onComplete()
        }
      }, durationMs + 50)
    }

    return () => {
      cancelAnimationFrame(frame)
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [durationMs, onComplete, session])

  function handleTransitionEnd(
    event: React.TransitionEvent<HTMLDivElement>,
  ) {
    if (
      event.propertyName !== "left" ||
      !session ||
      !animating ||
      completedRef.current
    ) {
      return
    }

    completedRef.current = true
    onComplete()
  }

  if (!isMounted || !session) {
    return null
  }

  const position = animating ? session.to : session.from

  return createPortal(
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        width: session.from.width,
        height: session.from.height,
        transform: "translate(-50%, -50%)",
        transition:
          durationMs > 0
            ? `left ${durationMs}ms ease-out, top ${durationMs}ms ease-out`
            : undefined,
      }}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden
    >
      <PlayingCard
        card={session.card}
        backVariant={backVariant}
        className="aspect-auto h-full w-full shadow-lg"
      />
    </div>,
    document.body,
  )
}
