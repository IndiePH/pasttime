import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteShell } from "@/components/shared"
import { getGameById } from "@/domain/games"
import { GamePlayView } from "@/features/games/components/game-play-view"

type PageProps = {
  params: Promise<{ slug: string }>
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

export default async function GamePlayPage({ params }: PageProps) {
  const { slug } = await params
  const game = getGameById(slug)

  if (!game || game.status !== "available") {
    notFound()
  }

  const modeLabel = game.tags.includes("multiplayer")
    ? "Solo practice"
    : "Solo play"

  return (
    <SiteShell>
      <GamePlayView game={game} modeLabel={modeLabel} />
    </SiteShell>
  )
}
