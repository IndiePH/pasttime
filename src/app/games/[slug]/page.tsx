import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SiteShell } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { getGameById } from "@/domain/games"
import { GameIcon } from "@/components/ui/icons"

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
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <GameIcon id={game.icon} className="size-20 rounded-2xl" title={game.title} />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{game.title}</h1>
        <p className="mt-2 text-muted-foreground">{game.description}</p>
        <p className="mt-8 rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
          Coming soon
        </p>
        <Button variant="outline" className="mt-8" asChild>
          <Link href="/">Back to catalog</Link>
        </Button>
      </div>
    </SiteShell>
  )
}
