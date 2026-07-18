import type { GameDefinition } from "@pasttime/domain/games"

interface SudokuHowToPlayProps {
  game: GameDefinition
}

export function SudokuHowToPlay({ game }: SudokuHowToPlayProps) {
  void game
  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">
        Fill every row, column, and 3×3 box with the digits 1–9, with no
        repeats. Click a cell, then type a number. Backspace clears it.
      </p>

      <section>
        <h3 className="font-medium">Normal vs. Candidates</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            <strong>Normal</strong> mode enters your final answer for a cell.
          </li>
          <li>
            <strong>Candidates</strong> mode marks small pencil notes for
            digits you&rsquo;re still considering — toggle it from the number
            pad.
          </li>
          <li>
            Turning on auto-candidates fills in every cell&rsquo;s remaining
            possibilities automatically as you play, so you only need to
            narrow them down.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-medium">Undo &amp; timer</h3>
        <p className="mt-2 text-muted-foreground">
          Use Undo to step back through recent moves. The timer keeps
          running while you play and freezes once the board is solved.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Change difficulty anytime from Settings before starting a new game.
      </p>
    </div>
  )
}
