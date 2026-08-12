/**
 * SSR editorial copy for the hub. Crawlers and AdSense reviewers need more
 * than a game grid to judge publisher value.
 */
export function HubEditorial() {
  return (
    <section
      className="mt-16 space-y-12 border-t border-border/60 pb-16 pt-12"
      aria-labelledby="hub-editorial-heading"
    >
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-4">
        <h2
          id="hub-editorial-heading"
          className="text-xl font-semibold tracking-tight sm:text-2xl lg:col-span-2"
        >
          A quieter place for classic puzzles
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Pasttime is built for people who want a real puzzle break without an
          install wall, a noisy feed, or a forced account. Open the site, pick a
          game, and play. Crossword, Word Guess, Sudoku, and Solitaire are
          ready in the browser on this device.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          Progress and preferences stay local by default. That keeps sessions
          private and makes it easy to pause mid-puzzle and return later. When
          you finish a daily challenge, you can still share a spoiler-light
          result without giving up your history to a cloud profile.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-medium tracking-tight">
            What you can play today
          </h3>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Crossword:</span>{" "}
              daily and random grids with across/down clues, local progress, and
              a calm board for longer solves.
            </li>
            <li>
              <span className="font-medium text-foreground">Word Guess:</span>{" "}
              find the hidden word with color feedback; choose length, daily or
              endless modes, and optional hard mode.
            </li>
            <li>
              <span className="font-medium text-foreground">Sudoku:</span>{" "}
              classic 9×9 logic puzzles with difficulty bands, notes, and a
              daily board when you want a shared challenge.
            </li>
            <li>
              <span className="font-medium text-foreground">Solitaire:</span>{" "}
              Klondike and related patience layouts with local save state and
              settings that stay out of the way.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium tracking-tight">
            How Pasttime stays free
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            The hub is supported by clearly labeled advertising so hosting and
            ongoing game work can stay free to play. We keep placements limited
            and publish a real{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </a>{" "}
            that explains AdSense-related data use. Details about who we are and
            how to reach us live on the{" "}
            <a
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              About
            </a>{" "}
            page.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Prefer a short reset or a longer streak. Playable titles stay in
            Top picks and All games. Coming soon cards are labeled separately
            and link to background pages until those games launch.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium tracking-tight">
          Tips for a better first session
        </h3>
        <ol className="grid list-decimal gap-4 pl-5 leading-relaxed text-muted-foreground md:grid-cols-3">
          <li>
            Open a game page and use How to play if you want the rules, then
            start a daily puzzle or a fresh run from the launch controls. The
            article below each title is background, not a second tutorial.
          </li>
          <li>
            Use the same browser if you want local streaks and unfinished boards
            to stick around. Clearing site data resets that device-only
            history.
          </li>
          <li>
            Check Stats after a few finishes if you like streaks and guess
            distributions; those screens stay personal to this browser.
          </li>
        </ol>
      </div>
    </section>
  )
}
