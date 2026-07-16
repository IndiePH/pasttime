import {
  getWordGuessMaxTries,
  type WordGuessLength,
} from "@pasttime/domain/games/word-guess"
import { cn } from "@/lib/utils"

interface WordBoardPreviewProps {
  wordLength: WordGuessLength
  className?: string
}

export function WordBoardPreview({
  wordLength,
  className,
}: WordBoardPreviewProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-1.5", className)}
      aria-hidden
    >
      {Array.from({ length: getWordGuessMaxTries(wordLength) }, (_, row) => (
        <div key={row} className="flex gap-1.5">
          {Array.from({ length: wordLength }, (_, col) => (
            <div
              key={col}
              className="size-11 rounded border border-border/80 bg-background/60 sm:size-12"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
