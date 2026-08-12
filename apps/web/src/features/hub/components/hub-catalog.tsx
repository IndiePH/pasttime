import { AdPanel, GameCard, type GameCardSize } from "@/components/shared"
import type { GameDefinition } from "@pasttime/domain/games"
import { cn } from "@/lib/utils"

function GameGrid({
  adSlot,
  adSlotIndex = 2,
  cardSize = "default",
  games,
}: {
  adSlot?: string
  adSlotIndex?: number
  cardSize?: GameCardSize
  games: GameDefinition[]
}) {
  if (games.length === 0 && !adSlot) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-12 text-left text-muted-foreground">
        No games match your search or filters.
      </p>
    )
  }

  const gamesBeforeAd = games.slice(0, adSlotIndex)
  const gamesAfterAd = games.slice(adSlotIndex)

  return (
    <ul
      className={cn(
        "grid items-start",
        cardSize === "compact"
          ? "gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : "gap-5 sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {gamesBeforeAd.map((game) => (
        <li key={game.id}>
          <GameCard game={game} size={cardSize} />
        </li>
      ))}
      {adSlot ? (
        <li>
          <AdPanel
            slot={adSlot}
            variant="card"
            matchGameCardSize={cardSize}
          />
        </li>
      ) : null}
      {gamesAfterAd.map((game) => (
        <li key={game.id}>
          <GameCard game={game} size={cardSize} />
        </li>
      ))}
    </ul>
  )
}

export function HubCatalog({
  comingSoon = [],
  featured,
  games,
}: {
  comingSoon?: GameDefinition[]
  featured: GameDefinition[]
  games: GameDefinition[]
}) {
  const featuredIds = new Set(featured.map((g) => g.id))
  const rest = games.filter((g) => !featuredIds.has(g.id))
  const showSplitLayout = featured.length > 0 && rest.length > 0
  const showFeaturedOnly = featured.length > 0 && rest.length === 0

  return (
    <div className="space-y-12 pb-16">
      {showSplitLayout ? (
        <section aria-labelledby="top-picks-heading">
          <h2
            id="top-picks-heading"
            className="mb-4 text-lg font-semibold tracking-tight"
          >
            Top picks
          </h2>
          <GameGrid cardSize="default" games={featured} />
        </section>
      ) : null}

      {showFeaturedOnly ? (
        <section aria-labelledby="games-heading">
          <h2
            id="games-heading"
            className="mb-4 text-lg font-semibold tracking-tight"
          >
            Games
          </h2>
          <GameGrid
            adSlot="hub-grid-card"
            adSlotIndex={2}
            cardSize="default"
            games={featured}
          />
        </section>
      ) : null}

      {!showFeaturedOnly ? (
        <section aria-labelledby="all-games-heading">
          <h2
            id="all-games-heading"
            className="mb-4 text-lg font-semibold tracking-tight"
          >
            {showSplitLayout ? "All games" : "Games"}
          </h2>
          <GameGrid
            adSlot="hub-grid-card"
            adSlotIndex={3}
            cardSize="compact"
            games={showSplitLayout ? rest : games}
          />
        </section>
      ) : null}

      {comingSoon.length > 0 ? (
        <section aria-labelledby="coming-soon-heading">
          <div className="mb-4 space-y-1">
            <h2
              id="coming-soon-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Coming soon
            </h2>
            <p className="text-sm text-muted-foreground">
              Not playable yet. Open a card for background on the game; play
              controls arrive when the title launches.
            </p>
          </div>
          <GameGrid cardSize="compact" games={comingSoon} />
        </section>
      ) : null}
    </div>
  )
}
