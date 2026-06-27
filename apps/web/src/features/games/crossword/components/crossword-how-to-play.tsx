import type { GameDefinition } from "@pasttime/domain/games"

interface CrosswordHowToPlayProps {
  game: GameDefinition
}

export function CrosswordHowToPlay({ game }: CrosswordHowToPlayProps) {
  void game
  return (
    <div className="space-y-3 text-sm">
      <p>
        Fill the grid by solving clues. Each white square holds one letter.
      </p>
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        <li>Click any white square to select it</li>
        <li>Type letters to fill answers</li>
        <li>Use Backspace to clear a letter</li>
        <li>Across answers read left-to-right</li>
        <li>Down answers read top-to-bottom</li>
      </ul>
    </div>
  )
}