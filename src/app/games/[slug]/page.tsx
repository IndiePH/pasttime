import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AdPanel, GameLaunchActions, SiteShell } from "@/components/shared"
import { getGameById } from "@/domain/games"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"

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
    title: `${game.title} — Pasttime`,
    description: game.description,
  }
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params
  const game = getGameById(slug)

  if (!game) {
    notFound()
  }

  return (
    <SiteShell>
      <GamePageShell>
        <GameSessionHeader game={game} subtitle={game.description} />
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
