import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteShell } from "@/components/shared"
import { gamePath, getGameById } from "@pasttime/domain/games"
import { GamePlayView } from "@/features/games/components/game-play-view"
import { getGameModule } from "@/features/games/module-registry"
import { parseGameSearchParams } from "@/features/games/parse-game-search-params"
import { pageMetadata } from "@/lib/seo"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
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
      path: `${gamePath(slug)}/play`,
      noIndex: true,
    })
  }
  return pageMetadata({
    title: `Play ${game.title}`,
    description: game.description,
    path: `${gamePath(game.id)}/play`,
    noIndex: true,
  })
}

export default async function GamePlayPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  await parseGameSearchParams(slug, searchParams)
  const game = getGameById(slug)

  if (!game || game.status !== "available") {
    notFound()
  }

  const modeLabel = game.tags.includes("multiplayer")
    ? "Solo practice"
    : "Solo play"

  const gameModule = getGameModule(slug)
  const PlayView = gameModule?.PlayView ?? GamePlayView

  return (
    <SiteShell>
      <PlayView game={game} modeLabel={modeLabel} />
    </SiteShell>
  )
}
