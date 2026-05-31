import type { GameIconId } from "@/domain/games"

import { SampleGridIcon } from "./sample-grid-icon"
import { SampleWordIcon } from "./sample-word-icon"

const ICONS = {
  "sample-word": SampleWordIcon,
  "sample-grid": SampleGridIcon,
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
