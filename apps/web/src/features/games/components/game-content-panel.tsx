"use client"

import { cn } from "@/lib/utils"

interface GameContentPanelProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  /** CSS length inset on each horizontal side of the content. */
  sideInset?: string
}

export function GameContentPanel({
  children,
  className,
  contentClassName,
  sideInset = "0.75rem",
}: GameContentPanelProps) {
  return (
    <div
      className={cn(
        "game-content-panel mx-auto w-fit max-w-full overflow-x-auto pt-1",
        className,
      )}
      style={{ paddingInline: sideInset }}
    >
      <div className={cn("w-fit", contentClassName)}>{children}</div>
    </div>
  )
}
