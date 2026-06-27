"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { crosswordSearchParams } from "@/features/games/crossword/search-params"

interface CrosswordSettingsWidgetProps {
  className?: string
}

export function CrosswordSettingsWidget({
  className,
}: CrosswordSettingsWidgetProps) {
  const [draftSize, setDraftSize] = React.useState<5 | 7 | 9 | 11 | 13 | 15>(15)
  const [sizeParam, setSizeParam] = useQueryState("size", crosswordSearchParams.size)
  const appliedSize = (sizeParam ?? 15) as 5 | 7 | 9 | 11 | 13 | 15
  const hasPendingChanges = draftSize !== appliedSize

  const handleOpen = React.useCallback(() => {
    setDraftSize(appliedSize)
  }, [appliedSize])

  const handleApply = React.useCallback(() => {
    void setSizeParam(draftSize)
  }, [draftSize, setSizeParam])

  const handleDismiss = React.useCallback(() => {
    setDraftSize(appliedSize)
  }, [appliedSize])

  return (
    <GameSettingsWidget
      className={className}
      panelClassName="w-[min(100vw-2rem,22rem)]"
      panelId="crossword-settings-panel"
      description="Grid size for this session."
      summary={`${appliedSize}x${appliedSize} grid`}
      onOpen={handleOpen}
      onDismiss={handleDismiss}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <div className="flex flex-wrap gap-2">
        {[5, 7, 9, 11, 13, 15].map((s) => {
          const isActive = draftSize === s
          return (
            <Button
              key={s}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              aria-pressed={isActive}
              onClick={() => setDraftSize(s as typeof draftSize)}
            >
              {s}x{s}
            </Button>
          )
        })}
      </div>
    </GameSettingsWidget>
  )
}