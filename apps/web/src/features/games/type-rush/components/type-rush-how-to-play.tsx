"use client"

import type { GameDefinition } from "@pasttime/domain/games"

export function TypeRushHowToPlay({ game }: { game: GameDefinition }) {
  void game

  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">
        Type the passage from left to right. Type Rush tracks your time,
        accuracy, and words per minute.
      </p>

      <section>
        <h3 className="font-medium">How a round works</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>Start typing the passage to begin the clock.</li>
          <li>
            Keep moving when you make a typo. Incorrect characters count against
            accuracy but do not stop your run.
          </li>
          <li>
            Backspace removes the last character. Turn Allow Backspace off in
            Settings to keep every keystroke.
          </li>
          <li>
            Finish the final character to complete the passage and see your
            result.
          </li>
        </ol>
      </section>

      <section>
        <h3 className="font-medium">Daily and practice</h3>
        <p className="mt-2 text-muted-foreground">
          Everyone gets the same daily passage. Practice mode gives you another
          curated passage whenever you want a fresh run.
        </p>
      </section>

      <section>
        <h3 className="font-medium">Content types</h3>
        <p className="mt-2 text-muted-foreground">
          Use Settings to switch between paragraphs, random words, whole
          numbers, or numbers with decimal points and thousands separators.
        </p>
      </section>
    </div>
  )
}
