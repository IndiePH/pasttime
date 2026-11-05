import { isTypingGame, type GameDefinition } from "@pasttime/domain/games"
import { cn } from "@/lib/utils"
import { TypingHandheldNotice } from "@/features/games/components/typing-handheld-notice"

import { gamePageShellClassName } from "./game-page-shell"
import { PlaySideBanner } from "./play-side-banner"

export type GamePlayLayout = "default" | "board"

export const gamePlayBoardShellClassName =
  "game-play-board mx-auto flex w-fit max-w-full flex-col items-center px-3 pt-6 pb-10 text-left sm:px-4 sm:pt-8 sm:pb-12"

interface GamePlayShellProps {
  children: React.ReactNode
  className?: string
  layout?: GamePlayLayout
  /** Left 160×600 placeholder. Off when the stage is already too wide. */
  sideBanner?: boolean
  /** When this game is tagged typing, the shell shows the handheld notice. */
  game?: GameDefinition
}

export function GamePlayShell({
  children,
  className,
  layout = "default",
  sideBanner = true,
  game,
}: GamePlayShellProps) {
  const notice =
    game && isTypingGame(game) ? (
      <TypingHandheldNotice gameId={game.id} />
    ) : null
  const field = (
    <div
      data-play-shell
      className={cn(
        layout === "board" ? gamePlayBoardShellClassName : gamePageShellClassName,
        className,
      )}
    >
      {children}
    </div>
  )

  return (
    <>
      {notice}
      {sideBanner ? (
        <PlaySideBanner />
      ) : null}
      {field}
    </>
  )
}
