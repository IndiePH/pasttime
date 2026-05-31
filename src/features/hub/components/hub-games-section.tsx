import { Suspense } from "react"

import type { GameDefinition } from "@/domain/games"
import { HubCatalog } from "@/features/hub/components/hub-catalog"
import { HubFilter } from "@/features/hub/components/hub-filter"

function HubFilterFallback() {
  return <div className="h-7 w-52 animate-pulse rounded-lg bg-muted" />
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {games.length} {games.length === 1 ? "game" : "games"}
        </p>
        <Suspense fallback={<HubFilterFallback />}>
          <HubFilter />
        </Suspense>
      </div>
      <HubCatalog featured={featured} games={games} />
    </>
  )
}
