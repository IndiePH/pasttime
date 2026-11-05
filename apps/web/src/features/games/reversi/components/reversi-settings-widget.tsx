"use client"

import { useState } from "react"

import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { SettingsToggleField } from "@/features/games/components/settings-toggle-field"
import { Button } from "@/components/ui/button"
import {
  formatDifficultyLabel,
  REVERSI_DIFFICULTIES,
  setReversiDifficulty,
  useReversiDifficulty,
} from "@/features/games/reversi/hooks/reversi-difficulty"
import {
  setReversiFlipAnimation,
  useReversiFlipAnimation,
} from "@/features/games/reversi/hooks/reversi-flip-animation"
import type { Difficulty } from "@pasttime/domain/games/reversi"

interface ReversiSettingsWidgetProps {
  className?: string
}

export function ReversiSettingsWidget({ className }: ReversiSettingsWidgetProps) {
  const difficulty = useReversiDifficulty()
  const flipAnimation = useReversiFlipAnimation()
  const [draft, setDraft] = useState<Difficulty>(difficulty)
  const [draftFlips, setDraftFlips] = useState(flipAnimation)

  return (
    <GameSettingsWidget
      className={className}
      panelId="reversi-settings-panel"
      description="Choose how strongly the computer plays, and whether captured discs turn over."
      summary={`${formatDifficultyLabel(difficulty)} · ${flipAnimation ? "Flips" : "Instant"}`}
      onOpen={() => {
        setDraft(difficulty)
        setDraftFlips(flipAnimation)
      }}
      onApply={() => {
        setReversiDifficulty(draft)
        setReversiFlipAnimation(draftFlips)
      }}
      applyDisabled={draft === difficulty && draftFlips === flipAnimation}
    >
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-muted-foreground">
          Difficulty
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty">
          {REVERSI_DIFFICULTIES.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={draft === option ? "default" : "outline"}
              aria-pressed={draft === option}
              onClick={() => setDraft(option)}
            >
              {formatDifficultyLabel(option)}
            </Button>
          ))}
        </div>
      </fieldset>
      <SettingsToggleField
        className="mt-4"
        label="Animate Flips"
        description="Turn captured discs over one at a time."
        value={draftFlips}
        onValueChange={setDraftFlips}
      />
    </GameSettingsWidget>
  )
}
