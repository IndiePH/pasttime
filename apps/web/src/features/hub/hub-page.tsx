import { SiteShell } from "@/components/shared"
import {
  filterGamesByStatus,
  filterGamesByTitle,
  getFeaturedGames,
} from "@pasttime/domain/games"
import { HubGamesSection } from "@/features/hub/components/hub-games-section"
import { HubHero } from "@/features/hub/components/hub-hero"
import { hubSearchParamsCache } from "@/features/hub/search-params"

export function HubPage() {
  const status = hubSearchParamsCache.get("status")
  const query = hubSearchParamsCache.get("q")
  const games = filterGamesByTitle(filterGamesByStatus(status), query)
  const featured = filterGamesByTitle(getFeaturedGames(status), query)

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <HubHero />
        <HubGamesSection games={games} featured={featured} />
      </div>
    </SiteShell>
  )
}
