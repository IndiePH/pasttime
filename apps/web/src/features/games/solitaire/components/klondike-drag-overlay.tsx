"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { useTheme } from "@/components/theme-provider"
import type { KlondikeDragSession } from "@/features/games/solitaire/hooks/use-klondike-drag"
import { PlayingCard } from "@/features/games/solitaire/components/playing-card"

interface KlondikeDragOverlayProps {
  session: KlondikeDragSession | null
}

export function KlondikeDragOverlay({ session }: KlondikeDragOverlayProps) {
  const { resolvedTheme } = useTheme()
  const backVariant = resolvedTheme === "dark" ? "light" : "dark"
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!isMounted || !session) {
    return null
  }

  const stackHeight =
    session.cardHeightPx +
    (session.cards.length - 1) * session.stackStepPx

  return createPortal(
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left: session.x,
        top: session.y,
        width: session.cardWidthPx,
        height: stackHeight,
        transform: "translate(-50%, -12%)",
      }}
      aria-hidden
    >
      {session.cards.map((card, index) => (
        <div
          key={card.id}
          className="absolute left-0"
          style={{
            top: index * session.stackStepPx,
            width: session.cardWidthPx,
            height: session.cardHeightPx,
            zIndex: index,
          }}
        >
          <PlayingCard
            card={card}
            backVariant={backVariant}
            className="aspect-auto h-full w-full shadow-lg"
          />
        </div>
      ))}
    </div>,
    document.body,
  )
}
