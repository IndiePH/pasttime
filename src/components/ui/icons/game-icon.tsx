import type { GameIconId } from "@/domain/games"

import { SampleCrewIcon } from "./sample-crew-icon"
import { SampleGridIcon } from "./sample-grid-icon"
import { SampleQuizIcon } from "./sample-quiz-icon"
import { SampleTilesIcon } from "./sample-tiles-icon"
import { SampleWordIcon } from "./sample-word-icon"

const ICONS = {
  "sample-word": SampleWordIcon,
  "sample-grid": SampleGridIcon,
  "sample-quiz": SampleQuizIcon,
  "sample-tiles": SampleTilesIcon,
  "sample-crew": SampleCrewIcon,
} satisfies Record<GameIconId, typeof SampleWordIcon>

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
