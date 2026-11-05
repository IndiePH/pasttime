"use client"

import type { GameDefinition } from "@pasttime/domain/games"

export function ReversiHowToPlay({ game }: { game: GameDefinition }) {
  void game

  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">
        You play Black. The computer plays White. Place a disc so it brackets
        one or more White discs. Those discs flip to Black.
      </p>
      <section>
        <h3 className="font-medium">How a match works</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>Black starts. The center four discs are already placed.</li>
          <li>Marked squares are your legal moves.</li>
          <li>A color with no legal move passes.</li>
          <li>
            Settings chooses Easy, Medium, or Hard for the computer. Animate
            Flips starts on, so each captured disc turns over.
          </li>
          <li>The match ends when neither color can move.</li>
          <li>The higher disc count wins. Equal counts draw.</li>
        </ol>
      </section>
    </div>
  )
}
