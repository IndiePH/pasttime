import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  GameLaunchActions,
  JsonLd,
  SiteShell,
} from "@/components/shared"
import {
  GAME_REGISTRY,
  gamePath,
  getGameById,
} from "@pasttime/domain/games"
import { GameLaunchSettings } from "@/features/games/components/game-launch-settings"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { GameOverviewSection } from "@/features/games/content/game-overview-section"
import { getGameModule } from "@/features/games/module-registry"
import { parseGameSearchParams } from "@/features/games/parse-game-search-params"
import { gameApplicationJsonLd, pageMetadata } from "@/lib/seo"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
  return GAME_REGISTRY.filter((game) => game.status === "available").map(
    (game) => ({ slug: game.id }),
  )
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
      path: gamePath(slug),
    })
  }
  return pageMetadata({
    title: game.title,
    description: game.description,
    path: gamePath(game.id),
  })
}

export default async function GamePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  await parseGameSearchParams(slug, searchParams)
  const game = getGameById(slug)

  if (!game) {
    notFound()
  }

  const gameModule = getGameModule(slug)
  const structuredData =
    game.status === "available" ? (
      <JsonLd data={gameApplicationJsonLd(game)} />
    ) : null

  if (game.status === "available" && gameModule?.LaunchView) {
    const LaunchView = gameModule.LaunchView
    return (
      <SiteShell>
        {structuredData}
        <LaunchView game={game} />
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      {structuredData}
      <GamePageShell>
        <GameSessionHeader game={game} subtitle={game.description} />
        <GameLaunchSettings game={game} className="mt-6" />
        <GameLaunchActions game={game} />
      </GamePageShell>
      <GameOverviewSection gameId={game.id} gameTitle={game.title} />
    </SiteShell>
  )
}
