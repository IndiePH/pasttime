import { Suspense } from "react"

import type { GameDefinition } from "@/domain/games"
import { HubCatalog } from "@/features/hub/components/hub-catalog"
import { HubFilter } from "@/features/hub/components/hub-filter"
import { HubGameSearch } from "@/features/hub/components/hub-game-search"

function HubToolbarFallback() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="h-9 w-full max-w-sm animate-pulse rounded-lg bg-muted" />
      <div className="h-7 w-52 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

export function HubGamesSection({
  featured,
  games,
}: {
  featured: GameDefinition[]
  games: GameDefinition[]
}) {
  return (
    <>
      <div className="mb-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          {games.length} {games.length === 1 ? "game" : "games"}
        </p>
        <Suspense fallback={<HubToolbarFallback />}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <HubGameSearch />
            <HubFilter className="sm:justify-end" />
          </div>
        </Suspense>
      </div>
      <HubCatalog featured={featured} games={games} />
    </>
  )
}
