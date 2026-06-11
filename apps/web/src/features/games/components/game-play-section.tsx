import type { GameDefinition } from "@pasttime/domain/games"
import { cn } from "@/lib/utils"

import { GamePlaySettings } from "./game-play-settings"
import { GameSessionHeader } from "./game-session-header"

export const gamePlaySettingsClassName = "mt-4 landscape:mt-3"

export type GamePlayContentLayout = "default" | "board"

const contentLayoutClassNames: Record<GamePlayContentLayout, string> = {
  default: "mt-3 w-full max-w-lg text-left",
  board: "mt-3 w-fit max-w-full landscape:mt-2 text-left",
}

interface GamePlaySectionProps {
  game: GameDefinition
  subtitle?: string
  headerDensity?: "default" | "compact"
  contentLayout?: GamePlayContentLayout
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/**
 * Standard play-area layout: session header, gameplay settings, board content,
 * then optional footer actions.
 */
export function GamePlaySection({
  game,
  subtitle,
  headerDensity = "default",
  contentLayout = "default",
  children,
  footer,
  className,
}: GamePlaySectionProps) {
  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <GameSessionHeader
        game={game}
        subtitle={subtitle}
        density={headerDensity}
      />
      <GamePlaySettings game={game} className={gamePlaySettingsClassName} />
      <div className={contentLayoutClassNames[contentLayout]}>{children}</div>
      {footer}
    </div>
  )
}
