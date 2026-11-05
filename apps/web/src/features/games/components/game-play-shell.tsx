import { isTypingGame, type GameDefinition } from "@pasttime/domain/games"
import { cn } from "@/lib/utils"
import { TypingHandheldNotice } from "@/features/games/components/typing-handheld-notice"

import { gamePageShellClassName } from "./game-page-shell"

export type GamePlayLayout = "default" | "board"

export const gamePlayBoardShellClassName =
  "game-play-board mx-auto flex w-fit max-w-full flex-col items-center px-3 pt-6 pb-10 text-left sm:px-4 sm:pt-8 sm:pb-12"

interface GamePlayShellProps {
  children: React.ReactNode
  className?: string
  layout?: GamePlayLayout
  /** When this game is tagged typing, the shell shows the handheld notice. */
  game?: GameDefinition
}

export function GamePlayShell({
  children,
  className,
  layout = "default",
  game,
}: GamePlayShellProps) {
  const notice =
    game && isTypingGame(game) ? (
      <TypingHandheldNotice gameId={game.id} />
    ) : null

  if (layout === "board") {
    return (
      <>
        {notice}
        <div className={cn(gamePlayBoardShellClassName, className)}>
          {children}
        </div>
      </>
    )
  }

  return (
    <>
      {notice}
      <div className={cn(gamePageShellClassName, className)}>{children}</div>
    </>
  )
}
