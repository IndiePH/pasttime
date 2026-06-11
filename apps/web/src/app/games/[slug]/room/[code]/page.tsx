import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteShell } from "@/components/shared"
import {
  getGameById,
  isMultiplayerGame,
  isValidRoomCode,
  normalizeRoomCode,
} from "@pasttime/domain/games"
import { RoomLobbyView } from "@/features/games/components/room-lobby-view"
import { parseGameSearchParams } from "@/features/games/parse-game-search-params"

type PageProps = {
  params: Promise<{ slug: string; code: string }>
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
    title: `${game.title} room — Pasttime`,
    description: game.description,
  }
}

export default async function GameRoomPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, code } = await params
  await parseGameSearchParams(slug, searchParams)
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
