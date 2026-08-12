import { getGameOverview } from "@/features/games/content/game-overviews"
import { cn } from "@/lib/utils"

interface GameOverviewSectionProps {
  gameId: string
  gameTitle: string
  className?: string
}

/**
 * Visible SSR article for game launch pages (AdSense / crawler-facing).
 * Origin and context, not a second How to play (that stays in the dialog).
 */
export function GameOverviewSection({
  gameId,
  gameTitle,
  className,
}: GameOverviewSectionProps) {
  const overview = getGameOverview(gameId)
  if (!overview) {
    return null
  }

  return (
    <article
      className={cn(
        "mx-auto w-full max-w-2xl px-4 pb-16 text-left sm:px-6",
        className,
      )}
      aria-labelledby={`${gameId}-overview-heading`}
    >
      <h2
        id={`${gameId}-overview-heading`}
        className="text-xl font-medium tracking-tight"
      >
        About {gameTitle}
      </h2>
      <div className="mt-4 space-y-3">
        {overview.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="mt-8 space-y-8">
        {overview.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h3 className="text-lg font-medium tracking-tight">{section.title}</h3>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  )
}
