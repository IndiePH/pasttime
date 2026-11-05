import { JsonLd, SiteShell } from "@/components/shared"
import {
  filterGamesByStatus,
  filterGamesByTitle,
  getFeaturedGames,
  type GameDefinition,
} from "@pasttime/domain/games"
import { HubEditorial } from "@/features/hub/components/hub-editorial"
import { HubGamesSection } from "@/features/hub/components/hub-games-section"
import { HubHero } from "@/features/hub/components/hub-hero"
import { hubSearchParamsCache } from "@/features/hub/search-params"
import { hubFaqs } from "@/features/hub/hub-faq"
import { faqPageJsonLd, gameCatalogJsonLd, websiteJsonLd } from "@/lib/seo"
import { loadGamePathViews } from "@/lib/traffic/store"
import { selectTopPicks, TOP_PICKS_LIMIT } from "@/lib/traffic/top-picks"

function matchingTitle(
  games: readonly GameDefinition[],
  query: string,
): GameDefinition[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...games]
  return games.filter((game) => game.title.toLowerCase().includes(normalized))
}

export async function HubPage() {
  // Playable games stay primary. Coming soon sits in its own section with
  // landing pages that carry origin copy (not empty shells).
  const query = hubSearchParamsCache.get("q")
  const available = filterGamesByStatus("available")
  const games = filterGamesByTitle(available, query)
  const ranked = selectTopPicks(
    available,
    await loadGamePathViews(),
    TOP_PICKS_LIMIT,
  )
  const featured = matchingTitle(
    ranked ?? getFeaturedGames("available", TOP_PICKS_LIMIT),
    query,
  )
  const comingSoon = filterGamesByTitle(
    filterGamesByStatus("coming_soon"),
    query,
  )

  return (
    <SiteShell>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={gameCatalogJsonLd(filterGamesByStatus("available"))} />
      <JsonLd data={faqPageJsonLd(hubFaqs())} />
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
