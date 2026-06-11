import { cn } from "@/lib/utils"

import { gamePageShellClassName } from "./game-page-shell"

export type GamePlayLayout = "default" | "board"

export const gamePlayBoardShellClassName =
  "game-play-board mx-auto flex w-fit max-w-full flex-col items-center px-3 pt-6 pb-10 text-left sm:px-4 sm:pt-8 sm:pb-12"

interface GamePlayShellProps {
  children: React.ReactNode
  className?: string
  layout?: GamePlayLayout
}

export function GamePlayShell({
  children,
  className,
  layout = "default",
}: GamePlayShellProps) {
  if (layout === "board") {
    return (
      <div className={cn(gamePlayBoardShellClassName, className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn(gamePageShellClassName, className)}>{children}</div>
  )
}
