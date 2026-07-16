"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import { CROSSWORD_GRID_SIZE_DEFAULT } from "@pasttime/domain/games/crossword"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { crosswordSearchParams } from "@/features/games/crossword/search-params"

interface CrosswordSettingsWidgetProps {
  className?: string
}

export function CrosswordSettingsWidget({
  className,
}: CrosswordSettingsWidgetProps) {
  const [, setSizeParam] = useQueryState("size", crosswordSearchParams.size)

  React.useEffect(() => {
    void setSizeParam(CROSSWORD_GRID_SIZE_DEFAULT)
  }, [setSizeParam])

  return (
    <GameSettingsWidget
      className={className}
      panelClassName="w-[min(100vw-2rem,22rem)]"
      panelId="crossword-settings-panel"
      description="Standard 15×15 crossword grid."
      summary="15×15 grid"
      applyDisabled
      onOpen={() => {}}
      onDismiss={() => {}}
      onApply={() => {}}
    >
      <p className="text-sm text-muted-foreground">
        Crossword uses a fixed 15×15 grid.
      </p>
    </GameSettingsWidget>
  )
}
