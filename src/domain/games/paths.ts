import { normalizeRoomCode } from "./room-code"

export function gamePlayPath(gameId: string): string {
  return `/games/${gameId}/play`
}

export function gameRoomPath(gameId: string, code: string): string {
  return `/games/${gameId}/room/${normalizeRoomCode(code)}`
}

export function gameLaunchPath(gameId: string): string {
  return `/games/${gameId}`
}
