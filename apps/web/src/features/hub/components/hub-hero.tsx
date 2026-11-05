import { TrustBadges } from "@/components/shared"

export function HubHero() {
  return (
    <section className="py-6 sm:py-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)] lg:items-end lg:gap-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Play more. Think sharper.
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Pasttime is a free hub for daily puzzles and classic games in your
            browser. No download, no account required.
          </p>
          <TrustBadges className="mt-4" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-6">
          <p className="text-muted-foreground">
            Crossword, Word Guess, Sudoku, Solitaire, Reversi, Type Rush, and
            Type Shield are ready to play. Each game keeps progress on your
            device and offers a calm layout built for a short break or a longer
            streak.
          </p>
          <p className="text-muted-foreground">
            Open a game page for the rules, then start a daily puzzle or a
            fresh run without signing up. Coming soon titles stay labeled
            until they can be played.
          </p>
        </div>
      </div>
    </section>
  )
}
