export type RoomPlayer = {
  id: string
  name: string
  isHost: boolean
}

export type RoomSummary = {
  code: string
  gameId: string
  settings: Record<string, unknown>
  hostId: string
  players: RoomPlayer[]
  createdAt: string
  status: "lobby" | "playing" | "finished"
  gameState: Record<string, unknown> | null
}

export type RoomState = RoomSummary

export type PasttimeClientConfig = {
  apiUrl: string
  wsUrl?: string
}

export type RoomSocketCallbacks = {
  onRoomUpdate: (room: RoomState) => void
  onError?: (error: string) => void
  onClose?: () => void
}
