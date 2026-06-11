"use client"

import { Button } from "@/components/ui/button"
import {
  SOLITAIRE_MODE_INFO,
  SOLITAIRE_MODES,
  type SolitaireMode,
} from "@pasttime/domain/games/solitaire"
import { cn } from "@/lib/utils"

type SolitaireModePickerProps = {
  className?: string
  compact?: boolean
  value: SolitaireMode
  onValueChange: (mode: SolitaireMode) => void
}

export function SolitaireModePicker({
  className,
  compact = false,
  value,
  onValueChange,
}: SolitaireModePickerProps) {
  return (
    <fieldset
      className={cn(compact ? "space-y-2" : "space-y-3 text-left", className)}
    >
      {compact ? (
        <legend className="sr-only">Game mode</legend>
      ) : (
        <>
          <legend className="text-sm font-medium">Game mode</legend>
          <p className="text-xs text-muted-foreground">
            Layout and rules for this session. Klondike is the classic default.
          </p>
        </>
      )}
      {compact && value ? (
        <p className="text-xs text-muted-foreground">
          {SOLITAIRE_MODE_INFO[value].tagline}
        </p>
      ) : null}
      <div
        className="flex w-full min-w-0 flex-col gap-2"
        role="group"
        aria-label="Solitaire game mode"
      >
        {SOLITAIRE_MODES.map((mode) => {
          const isActive = value === mode
          const { label, tagline } = SOLITAIRE_MODE_INFO[mode]
          return (
            <Button
              key={mode}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-auto w-full min-w-0 px-3 py-2 text-left whitespace-normal",
                compact
                  ? "min-h-9 justify-start"
                  : "min-h-9 flex-col items-start gap-0.5",
              )}
              aria-pressed={isActive}
              onClick={() => onValueChange(mode)}
            >
              <span className="font-medium">{label}</span>
              {compact ? null : (
                <span
                  className={cn(
                    "text-xs font-normal",
                    isActive
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {tagline}
                </span>
              )}
            </Button>
          )
        })}
      </div>
    </fieldset>
  )
}
