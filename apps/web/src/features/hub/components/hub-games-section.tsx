import { Suspense } from "react"

import type { GameDefinition } from "@pasttime/domain/games"
import { HubCatalog } from "@/features/hub/components/hub-catalog"
import { HubGameSearch } from "@/features/hub/components/hub-game-search"

function HubToolbarFallback() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="h-9 w-full max-w-sm rounded-lg bg-muted" />
    </div>
  )
}

export function HubGamesSection({
  comingSoon = [],
  featured,
  games,
}: {
  comingSoon?: GameDefinition[]
  featured: GameDefinition[]
  games: GameDefinition[]
}) {
  return (
    <>
      <div className="mb-5 space-y-3">
        <p className="text-sm text-muted-foreground">
          {games.length} {games.length === 1 ? "game" : "games"} ready to play
          {comingSoon.length > 0
            ? ` · ${comingSoon.length} coming soon`
            : null}
        </p>
        <Suspense fallback={<HubToolbarFallback />}>
          <HubGameSearch />
        </Suspense>
      </div>
      <HubCatalog
        comingSoon={comingSoon}
        featured={featured}
        games={games}
      />
    </>
  )
}
