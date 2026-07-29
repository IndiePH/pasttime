import { TrustBadges } from "@/components/shared"

export function HubHero() {
  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Play more. Think sharper.
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Pasttime is a free hub for daily puzzles and classic games in your
          browser — no download, no account required.
        </p>
        <p className="mt-3 text-muted-foreground">
          Jump into Crossword, Word Guess, Sudoku, or Solitaire. Each game keeps
          progress on your device and offers a calm layout built for a short
          break or a longer streak.
        </p>
        <TrustBadges className="mt-6" />
      </div>
    </section>
  )
}
