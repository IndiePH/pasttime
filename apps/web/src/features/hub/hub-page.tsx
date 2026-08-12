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
  // Hub surfaces playable games only — coming-soon entries stay in the registry
  // for future launches but are hidden from the catalog AdSense/crawlers see.
  const query = hubSearchParamsCache.get("q")
  const games = filterGamesByTitle(filterGamesByStatus("available"), query)
  const featured = filterGamesByTitle(getFeaturedGames("available"), query)

  return (
    <SiteShell>
      <JsonLd data={websiteJsonLd()} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <HubHero />
        <HubGamesSection games={games} featured={featured} />
        <HubEditorial />
      </div>
    </SiteShell>
  )
}
