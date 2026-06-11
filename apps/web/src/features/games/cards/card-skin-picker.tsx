"use client"

import { Button } from "@/components/ui/button"
import {
  formatPlayingCardVariantLabel,
  PLAYING_CARD_VARIANTS,
  type PlayingCardVariant,
} from "@pasttime/domain/games"
import { cn } from "@/lib/utils"

interface CardSkinPickerProps {
  className?: string
  compact?: boolean
  value: PlayingCardVariant
  onValueChange: (variant: PlayingCardVariant) => void
}

export function CardSkinPicker({
  className,
  compact = false,
  value,
  onValueChange,
}: CardSkinPickerProps) {
  return (
    <fieldset className={cn(compact ? "space-y-2" : "space-y-3", className)}>
      {compact ? (
        <legend className="text-sm font-medium">Card skin</legend>
      ) : (
        <>
          <legend className="text-sm font-medium">Card skin</legend>
          <p className="text-xs text-muted-foreground">
            Face and back artwork for card games.
          </p>
        </>
      )}
      <div
        className="flex w-full min-w-0 flex-col gap-2"
        role="group"
        aria-label="Card skin"
      >
        {PLAYING_CARD_VARIANTS.map((variant) => {
          const isActive = value === variant
          return (
            <Button
              key={variant}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-auto min-h-9 w-full min-w-0 justify-start px-3 py-2 text-left whitespace-normal"
              aria-pressed={isActive}
              onClick={() => onValueChange(variant)}
            >
              {formatPlayingCardVariantLabel(variant)}
            </Button>
          )
        })}
      </div>
    </fieldset>
  )
}
