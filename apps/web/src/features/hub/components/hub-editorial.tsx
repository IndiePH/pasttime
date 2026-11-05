import { filterGamesByStatus, gamePath } from "@pasttime/domain/games"
import { hubFaqs } from "@/features/hub/hub-faq"
import { PlatformLink } from "@/platform/navigation"

const PLAYABLE_BLURBS: Record<string, string> = {
  crossword:
    "daily and random grids with across and down clues, local progress, and a calm board.",
  "word-guess":
    "find the hidden word with color feedback. Choose length, daily or endless, and optional hard mode. Rooms support up to four players.",
  sudoku:
    "classic 9×9 logic puzzles. Every row, column, and box holds 1–9 once, with difficulty bands, notes, and a daily board.",
  solitaire: "Klondike and related patience layouts, with local save state.",
  reversi: "play Black against the computer and flip bracketed discs.",
  "type-rush": "type a passage for time, accuracy, and words per minute.",
  "type-shield": "type the word on a falling comet before it reaches the dome.",
}

/**
 * SSR editorial copy for the hub. Crawlers need more than a game grid.
 */
export function HubEditorial() {
  const playable = filterGamesByStatus("available")
  const faqs = hubFaqs()
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
          playable game, and start. Coming soon cards stay labeled until those
          games launch.
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
            {playable.map((game) => (
              <li key={game.id}>
                <PlatformLink
                  href={gamePath(game.id)}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
                >
                  {game.title}
                </PlatformLink>
                : {PLAYABLE_BLURBS[game.id] ?? game.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium tracking-tight">
            How Pasttime stays free
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            Browser games on this site are free to play. Banner ads from Adsterra
            support the site. The Word Guess Android app is supported by Unity
            LevelPlay advertising, described in its{" "}
            <a
              href="/word-guess/policy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              privacy policy
            </a>
            . The site{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </a>{" "}
            covers the website. Details about who we are and how to reach us
            live on the{" "}
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
            Open a game page and use How To Play if you want the rules, then
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

      <div className="space-y-8">
        <h3 className="text-lg font-medium tracking-tight">
          Questions about Pasttime
        </h3>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <section key={faq.question} className="space-y-2">
              <h4 className="font-medium tracking-tight">{faq.question}</h4>
              <p className="leading-relaxed text-muted-foreground">{faq.answer}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
