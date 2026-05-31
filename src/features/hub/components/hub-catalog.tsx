import { GameCard } from "@/components/shared"
import type { GameDefinition } from "@/domain/games"

function GameGrid({
  games,
  featured = false,
}: {
  games: GameDefinition[]
  featured?: boolean
}) {
  if (games.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
        No games match this filter.
      </p>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} featured={featured} />
        </li>
      ))}
    </ul>
  )
}

export function HubCatalog({
  featured,
  games,
}: {
  featured: GameDefinition[]
  games: GameDefinition[]
}) {
  const featuredIds = new Set(featured.map((g) => g.id))
  const rest = games.filter((g) => !featuredIds.has(g.id))
  const showFeatured = featured.length > 0 && rest.length > 0

  return (
    <div className="space-y-12 pb-16">
      {showFeatured && (
        <section aria-labelledby="top-picks-heading">
          <h2
            id="top-picks-heading"
            className="mb-4 text-lg font-semibold tracking-tight"
          >
            Top picks
          </h2>
          <GameGrid games={featured} featured />
        </section>
      )}

      <section aria-labelledby="all-games-heading">
        <h2
          id="all-games-heading"
          className="mb-4 text-lg font-semibold tracking-tight"
        >
          {showFeatured ? "All games" : "Games"}
        </h2>
        <GameGrid games={showFeatured ? rest : games} />
      </section>
    </div>
  )
}
