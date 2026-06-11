import { normalizeRoomCode } from "./room-code"

/** Route kinds for cross-platform navigation (web paths, RN stacks, deep links). */
export const GameRoute = {
  Launch: "launch",
  Play: "play",
  Room: "room",
} as const

export type GameRouteKind = (typeof GameRoute)[keyof typeof GameRoute]

export function gamePlayPath(gameId: string): string {
  return `/games/${gameId}/play`
}

export function gameRoomPath(gameId: string, code: string): string {
  return `/games/${gameId}/room/${normalizeRoomCode(code)}`
}

export function gameLaunchPath(gameId: string): string {
  return `/games/${gameId}`
}
