import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteShell } from "@/components/shared"
import { getGameById } from "@pasttime/domain/games"
import { GamePlayView } from "@/features/games/components/game-play-view"
import { getGameModule } from "@/features/games/module-registry"
import { parseGameSearchParams } from "@/features/games/parse-game-search-params"

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
    return { title: "Game not found — Pasttime" }
  }
  return {
    title: `Play ${game.title} — Pasttime`,
    description: game.description,
  }
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
