"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import {
  formatWordLengthLabel,
  getWordGuessMaxTries,
  type WordGuessLength,
} from "@pasttime/domain/games/word-guess"
import { cn } from "@/lib/utils"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"

function TileLegendItem({
  label,
  description,
  tileClassName,
  letter,
}: {
  label: string
  description: string
  tileClassName: string
  letter: string
}) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded text-sm font-semibold text-white",
          tileClassName,
        )}
        aria-hidden
      >
        {letter}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </li>
  )
}

export function WordGuessHowToPlay({ game }: { game: GameDefinition }) {
  void game
  const [lettersParam] = useQueryState(
    "letters",
    wordGuessSearchParams.letters,
  )
  const wordLength = Number(lettersParam) as WordGuessLength
  const maxTries = getWordGuessMaxTries(wordLength)

  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">
        Guess the hidden {formatWordLengthLabel(wordLength)} in {maxTries}{" "}
        tries. Each guess must be a real word with the same number of letters.
      </p>

      <section>
        <h3 className="font-medium">How a turn works</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>Type a valid word and submit your guess.</li>
          <li>
            Tile colors show how close you are. Use them to narrow your next
            guess.
          </li>
          <li>
            Win by finding the word before you run out of rows; lose if all{" "}
            {maxTries} guesses are used.
          </li>
        </ol>
      </section>

      <section>
        <h3 className="font-medium">Tile colors</h3>
        <ul className="mt-3 space-y-3">
          <TileLegendItem
            letter="A"
            label="Correct spot"
            description="The letter is in the word and in the right position."
            tileClassName="bg-emerald-600"
          />
          <TileLegendItem
            letter="E"
            label="Wrong spot"
            description="The letter is in the word but in a different position."
            tileClassName="bg-amber-500"
          />
          <TileLegendItem
            letter="Z"
            label="Not in word"
            description="The letter does not appear in the word at all."
            tileClassName="bg-muted-foreground/70"
          />
        </ul>
      </section>

      <section>
        <h3 className="font-medium">Playing with others</h3>
        <p className="mt-2 text-muted-foreground">
          Create a room to host up to four players, or join with a room code.
          Everyone works toward the same word. Share clues from your guesses
          without revealing the answer directly.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Change word length anytime from Settings before you start a solo game or
        room.
      </p>
    </div>
  )
}
