import { JsonLd, SiteShell } from "@/components/shared"
import {
  filterGamesByStatus,
  filterGamesByTitle,
  getFeaturedGames,
} from "@pasttime/domain/games"
import { HubEditorial } from "@/features/hub/components/hub-editorial"
import { HubGamesSection } from "@/features/hub/components/hub-games-section"
import { HubHero } from "@/features/hub/components/hub-hero"
import { hubSearchParamsCache } from "@/features/hub/search-params"
import { websiteJsonLd } from "@/lib/seo"

export function HubPage() {
  // Playable games stay primary. Coming soon sits in its own section with
  // landing pages that carry origin copy (not empty shells).
  const query = hubSearchParamsCache.get("q")
  const games = filterGamesByTitle(filterGamesByStatus("available"), query)
  const featured = filterGamesByTitle(getFeaturedGames("available"), query)
  const comingSoon = filterGamesByTitle(
    filterGamesByStatus("coming_soon"),
    query,
  )

  return (
    <SiteShell>
      <JsonLd data={websiteJsonLd()} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <HubHero />
        <HubGamesSection
          comingSoon={comingSoon}
          featured={featured}
          games={games}
        />
        <HubEditorial />
      </div>
    </SiteShell>
  )
}
