"use client"

import * as React from "react"

import {
  playingCardBackSrc,
  playingCardFaceSrc,
  playingCardRankFromValue,
  type PlayingCardBackVariant,
  type PlayingCardVariant,
} from "@pasttime/domain/games"
import type { KlondikeCard } from "@pasttime/domain/games/solitaire"

import { cn } from "@/lib/utils"

const DOUBLE_CLICK_MS = 300

interface PlayingCardProps {
  card?: KlondikeCard | null
  variant?: PlayingCardVariant
  backVariant?: PlayingCardBackVariant
  selected?: boolean
  className?: string
  onClick?: () => void
  onDoubleClick?: () => void
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void
  dragSourceHidden?: boolean
  ariaLabel?: string
}

export function PlayingCard({
  card,
  variant,
  backVariant = "dark",
  selected = false,
  className,
  onClick,
  onDoubleClick,
  onPointerDown,
  dragSourceHidden = false,
  ariaLabel,
}: PlayingCardProps) {
  const lastClickAtRef = React.useRef(0)

  const src = card
    ? card.faceUp
      ? playingCardFaceSrc({
          variant,
          suit: card.suit,
          rank: playingCardRankFromValue(card.rank),
        })
      : playingCardBackSrc({ variant, back: backVariant })
    : null

  if (!src) {
    return null
  }

  function handleClick() {
    if (!onClick) {
      return
    }

    const now = Date.now()
    const isSecondClickOfDouble =
      onDoubleClick !== undefined &&
      now - lastClickAtRef.current < DOUBLE_CLICK_MS

    lastClickAtRef.current = now

    if (isSecondClickOfDouble) {
      return
    }

    onClick()
  }

  function handleDoubleClick() {
    lastClickAtRef.current = 0
    onDoubleClick?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={onDoubleClick ? handleDoubleClick : undefined}
      onPointerDown={onPointerDown}
      aria-label={ariaLabel}
      className={cn(
        "relative block aspect-[3/4] w-full overflow-hidden rounded-md border border-border/70 bg-card shadow-sm transition",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        dragSourceHidden && "opacity-0",
        onClick && "cursor-pointer hover:-translate-y-0.5",
        onPointerDown && "touch-none",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
    </button>
  )
}

interface CardSlotProps extends React.ComponentProps<"button"> {
  onClick?: () => void
  ariaLabel?: string
}

export function CardSlot({
  className,
  onClick,
  ariaLabel,
  ...props
}: CardSlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "block aspect-[3/4] w-full rounded-md border border-dashed border-border/70 bg-muted/20",
        onClick && "cursor-pointer hover:bg-muted/40",
        className,
      )}
      {...props}
    />
  )
}
