"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type WordGuessBoardTileState =
  | "empty"
  | "filled"
  | "correct"
  | "present"
  | "absent"

interface WordGuessTileProps {
  letter: string
  state: WordGuessBoardTileState
  flip?: boolean
  flipIndex?: number
}

const TILE_STATE_CLASS_NAME: Record<WordGuessBoardTileState, string> = {
  empty: "border-border/80 bg-background/60",
  filled: "border-foreground/30 bg-background",
  correct: "border-emerald-600 bg-emerald-600 text-white",
  present: "border-amber-500 bg-amber-500 text-white",
  absent: "border-muted-foreground/70 bg-muted-foreground/70 text-white",
}

function tileStateLabel(state: WordGuessBoardTileState): string {
  if (state === "correct") {
    return "correct position"
  }
  if (state === "present") {
    return "wrong position"
  }
  if (state === "absent") {
    return "not in answer"
  }
  if (state === "filled") {
    return "pending guess"
  }

  return "empty"
}

export function WordGuessTile({
  letter,
  state,
  flip = false,
  flipIndex = 0,
}: WordGuessTileProps) {
  const [revealed, setRevealed] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect reduced motion preference
  const prefersReducedMotion = React.useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  // When a new flip animation starts, hold the "filled" state
  // until the midpoint of the stagger-delayed animation (200ms + stagger).
  React.useEffect(() => {
    if (flip) {
      setRevealed(false)

      // Reveal color at the midpoint of the flip animation.
      // The CSS keyframe reaches 50% (rotateX -90°) at 200ms, which is
      // the ideal moment to swap the visible face.
      // For reduced motion, reveal immediately (no animation to wait for).
      const revealMs = prefersReducedMotion.current ? 0 : flipIndex * 80 + 200
      timerRef.current = setTimeout(() => setRevealed(true), revealMs)

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [flip, flipIndex])

  // During an active flip, show "filled" until the midpoint reveal
  const displayState = flip && !revealed ? "filled" : state

  const normalizedLetter = letter.toUpperCase()
  const displayLetter = normalizedLetter || "\u00a0"
  const ariaLabel = normalizedLetter
    ? `${normalizedLetter}, ${tileStateLabel(state)}`
    : "Empty tile"

  return (
    <span
      className={cn(
        "flex size-11 items-center justify-center rounded border text-lg font-semibold tracking-wide uppercase transition-colors sm:size-12",
        TILE_STATE_CLASS_NAME[displayState],
        flip && "word-guess-tile-flip",
        flip && `word-guess-tile-flip-delay-${Math.min(flipIndex, 9)}`,
      )}
      aria-label={ariaLabel}
    >
      {displayLetter}
    </span>
  )
}
