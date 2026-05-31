import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteShell } from "@/components/shared"
import {
  getGameById,
  isMultiplayerGame,
  isValidRoomCode,
  normalizeRoomCode,
} from "@/domain/games"
import { RoomLobbyView } from "@/features/games/components/room-lobby-view"

type PageProps = {
  params: Promise<{ slug: string; code: string }>
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
    title: `${game.title} room — Pasttime`,
    description: game.description,
  }
}

export default async function GameRoomPage({ params }: PageProps) {
  const { slug, code } = await params
  const game = getGameById(slug)
  const roomCode = normalizeRoomCode(code)

  if (
    !game ||
    game.status !== "available" ||
    !isMultiplayerGame(game) ||
    !isValidRoomCode(roomCode)
  ) {
    notFound()
  }

  return (
    <SiteShell>
      <RoomLobbyView game={game} roomCode={roomCode} />
    </SiteShell>
  )
}
