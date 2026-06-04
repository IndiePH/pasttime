import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AdPanel, GameLaunchActions, SiteShell } from "@/components/shared"
import { getGameById } from "@/domain/games"
import { GameLaunchSettings } from "@/features/games/components/game-launch-settings"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
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
    title: `${game.title} — Pasttime`,
    description: game.description,
  }
}

export default async function GamePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  await parseGameSearchParams(slug, searchParams)
  const game = getGameById(slug)

  if (!game) {
    notFound()
  }

  const gameModule = getGameModule(slug)

  if (game.status === "available" && gameModule?.LaunchView) {
    const LaunchView = gameModule.LaunchView
    return (
      <SiteShell>
        <LaunchView game={game} />
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <GamePageShell>
        <GameSessionHeader game={game} subtitle={game.description} />
        <GameLaunchSettings game={game} className="mt-6" />
        <GameLaunchActions game={game} />
        <AdPanel
          slot="game-below-launch"
          variant="box"
          className="mt-10 w-full"
        />
      </GamePageShell>
    </SiteShell>
  )
}
