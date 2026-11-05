import type { GameIconId } from "@pasttime/domain/games"
import {
  Blocks,
  Disc,
  Factory,
  Grid3x3,
  Keyboard,
  LayoutGrid,
  LetterText,
  Shield,
  Ship,
  Spade,
  SquareStack,
  WalletCards,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const ICONS = {
  "word-guess": LetterText,
  solitaire: SquareStack,
  tongits: WalletCards,
  "pusoy-dos": WalletCards,
  crossword: LayoutGrid,
  sudoku: Grid3x3,
  reversi: Disc,
  "fleet-grid": Ship,
  spades: Spade,
  "word-factory": Factory,
  "type-rush": Keyboard,
  "type-shield": Shield,
  "tile-words": Blocks,
} satisfies Record<GameIconId, LucideIcon>

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
  return (
    <span
      className={cn(
        "relative inline-grid place-items-center text-primary",
        className,
      )}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <span
        aria-hidden
        className="icon-plate absolute inset-0 rounded-[22%] bg-muted"
      />
      <Icon aria-hidden className="relative size-[58%]" />
    </span>
  )
}
