import type { GameIconId } from "@pasttime/domain/games"

import { SampleCrewIcon } from "./sample-crew-icon"
import { SampleGridIcon } from "./sample-grid-icon"
import { SampleQuizIcon } from "./sample-quiz-icon"
import { SampleTilesIcon } from "./sample-tiles-icon"
import { WordGuessIcon } from "./word-guess-icon"

const ICONS = {
  "word-guess": WordGuessIcon,
  solitaire: SampleCrewIcon,
  tongits: SampleCrewIcon,
  "pusoy-dos": SampleCrewIcon,
  crossword: SampleGridIcon,
  sudoku: SampleGridIcon,
  reversi: SampleTilesIcon,
  "fleet-grid": SampleQuizIcon,
  spades: SampleCrewIcon,
  "word-factory": WordGuessIcon,
  "type-rush": SampleQuizIcon,
  "type-shield": SampleQuizIcon,
  "tile-words": WordGuessIcon,
} satisfies Record<GameIconId, typeof WordGuessIcon>

export function GameIcon({
  id,
  className,
  title,
}: {
  id: GameIconId
  className?: string
  title?: string
}) {
  const Icon = ICONS[id]
  return <Icon className={className} role={title ? "img" : undefined} aria-label={title} />
}
