import { isTypingGame, type GameDefinition } from "@pasttime/domain/games"
import { cn } from "@/lib/utils"
import { TypingHandheldNotice } from "@/features/games/components/typing-handheld-notice"

export const gamePageShellClassName =
  "mx-auto flex max-w-lg flex-col items-center px-4 pt-10 pb-16 text-center sm:px-6 sm:pt-14 sm:pb-24"

export function GamePageShell({
  children,
  className,
  game,
}: {
  children: React.ReactNode
  className?: string
  /** When this game is tagged typing, the shell shows the handheld notice. */
  game?: GameDefinition
}) {
  return (
    <div className={cn(gamePageShellClassName, className)}>
      {game && isTypingGame(game) ? (
        <TypingHandheldNotice gameId={game.id} />
      ) : null}
      {children}
    </div>
  )
}
