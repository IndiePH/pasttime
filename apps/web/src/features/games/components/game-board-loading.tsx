import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface GameBoardLoadingProps {
  /** Accessible label announced to screen readers; not shown visually. */
  label?: string
  className?: string
}

/**
 * Lone centered spinner for play pages while R2/D1 lexicon data arrives.
 * Board chrome stays hidden until ready.
 */
export function GameBoardLoading({
  label = "Loading game…",
  className,
}: GameBoardLoadingProps) {
  return (
    <div
      className={cn(
        "flex min-h-[min(60vh,28rem)] w-full items-center justify-center",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <Loader2
        className="size-8 animate-spin text-muted-foreground"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
