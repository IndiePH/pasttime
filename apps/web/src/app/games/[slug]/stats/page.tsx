import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteShell } from "@/components/shared"
import { gamePath, getGameById } from "@pasttime/domain/games"
import { getGameModule } from "@/features/games/module-registry"
import { pageMetadata } from "@/lib/seo"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const game = getGameById(slug)
  if (!game) {
    return pageMetadata({
      title: "Game not found",
      description: "That game is not available on Pasttime.",
      path: `${gamePath(slug)}/stats`,
      noIndex: true,
    })
  }
  return pageMetadata({
    title: `${game.title} Stats`,
    description: `Your ${game.title} stats and streaks.`,
    path: `${gamePath(game.id)}/stats`,
    noIndex: true,
  })
}

export default async function GameStatsPage({ params }: PageProps) {
  const { slug } = await params
  const game = getGameById(slug)

  if (!game) {
    notFound()
  }

  const gameModule = getGameModule(slug)
  const StatsView = gameModule?.StatsView

  // If no stats view is registered, show a simple fallback
  if (!StatsView) {
    return (
      <SiteShell>
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 pt-10 pb-16 text-center sm:px-6 sm:pt-14 sm:pb-24">
          <h1 className="text-2xl font-semibold tracking-tight">
            {game.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stats are not available for this game yet.
          </p>
        </div>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <StatsView game={game} />
    </SiteShell>
  )
}
