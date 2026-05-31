import { SiteShell } from "@/components/shared"
import {
  filterGamesByStatus,
  getFeaturedGames,
} from "@/domain/games"
import { HubGamesSection } from "@/features/hub/components/hub-games-section"
import { HubHero } from "@/features/hub/components/hub-hero"
import { hubSearchParamsCache } from "@/features/hub/search-params"

export function HubPage() {
  const status = hubSearchParamsCache.get("status")
  const games = filterGamesByStatus(status)
  const featured = getFeaturedGames(status)

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <HubHero />
        <HubGamesSection games={games} featured={featured} />
      </div>
    </SiteShell>
  )
}
