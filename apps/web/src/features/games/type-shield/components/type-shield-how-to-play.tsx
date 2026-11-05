"use client"

import type { GameDefinition } from "@pasttime/domain/games"

export function TypeShieldHowToPlay({ game }: { game: GameDefinition }) {
  void game

  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">
        Comets fall toward a dome at the bottom of the stage. Type the word in
        a comet to destroy it before it hits the shield.
      </p>
      <section>
        <h3 className="font-medium">How a round works</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>
            A round waits 3 seconds, then the first comet falls. Each comet
            carries one dictionary word of at least 5 letters, and
            shorter words fall faster. Easy uses 5 or 6 letters, and the
            6-letter words show up less often. Medium uses 5 to 8 letters the
            same way. Hard uses every length from 5 letters up. Nightmare uses
            those same lengths but favors the longer words. Easy asks for
            about 15–35 WPM. The other difficulties are faster, and Nightmare
            keeps speeding up.
          </li>
          <li>
            From Medium up, a spawn sometimes releases more than one comet.
            Medium sends at most two. Hard and Nightmare send at most three,
            and Nightmare does it more often. Those comets share the typing
            pace, so they fall slower.
          </li>
          <li>
            Type a word. Shared letters light up on every comet they still
            fit, so met marks both meteor and metric. The comet locks when
            the letters fit only that word.
          </li>
          <li>Backspace removes the last letter of the locked word.</li>
          <li>A comet that reaches the dome costs one life.</li>
          <li>
            Endless ends when the shield has no lives left. Survival is won by
            lasting 2 minutes.
          </li>
        </ol>
      </section>
    </div>
  )
}
