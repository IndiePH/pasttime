import { cn } from "@/lib/utils"

export type WordGuessBoardTileState =
  | "empty"
  | "filled"
  | "correct"
  | "present"
  | "absent"

interface WordGuessTileProps {
  letter: string
  state: WordGuessBoardTileState
}

const TILE_STATE_CLASS_NAME: Record<WordGuessBoardTileState, string> = {
  empty: "border-border/80 bg-background/60",
  filled: "border-foreground/30 bg-background",
  correct: "border-emerald-600 bg-emerald-600 text-white",
  present: "border-amber-500 bg-amber-500 text-white",
  absent: "border-muted-foreground/70 bg-muted-foreground/70 text-white",
}

function tileStateLabel(state: WordGuessBoardTileState): string {
  if (state === "correct") {
    return "correct position"
  }
  if (state === "present") {
    return "wrong position"
  }
  if (state === "absent") {
    return "not in answer"
  }
  if (state === "filled") {
    return "pending guess"
  }

  return "empty"
}

export function WordGuessTile({ letter, state }: WordGuessTileProps) {
  const normalizedLetter = letter.toUpperCase()
  const displayLetter = normalizedLetter || "\u00a0"
  const ariaLabel = normalizedLetter
    ? `${normalizedLetter}, ${tileStateLabel(state)}`
    : "Empty tile"

  return (
    <span
      className={cn(
        "flex size-11 items-center justify-center rounded border text-lg font-semibold tracking-wide uppercase transition-colors sm:size-12",
        TILE_STATE_CLASS_NAME[state],
      )}
      aria-label={ariaLabel}
    >
      {displayLetter}
    </span>
  )
}
