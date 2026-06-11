import {
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
} from "@pasttime/domain/games"

export type RoomPlayer = {
  id: string
  name: string
  isHost: boolean
}

export type RoomRecord = {
  code: string
  gameId: string
  settings: Record<string, unknown>
  hostId: string
  players: RoomPlayer[]
  status: "lobby" | "playing" | "finished"
  gameState: Record<string, unknown> | null
  createdAt: string
  expiresAt: number
}

const ROOM_TTL_MS = 2 * 60 * 60 * 1000

const rooms = new Map<string, RoomRecord>()

function createPlayerId(): string {
  return crypto.randomUUID()
}

function pruneExpired() {
  const now = Date.now()
  for (const [code, room] of rooms) {
    if (room.expiresAt <= now) {
      rooms.delete(code)
    }
  }
}

export function getRoom(code: string): RoomRecord | undefined {
  pruneExpired()
  return rooms.get(normalizeRoomCode(code))
}

export function createRoom(input: {
  gameId: string
  code?: string
  settings?: Record<string, unknown>
  hostName?: string
}): RoomRecord {
  pruneExpired()
  const code = input.code
    ? normalizeRoomCode(input.code)
    : generateRoomCode()

  if (!isValidRoomCode(code)) {
    throw new Error("Invalid room code")
  }

  if (rooms.has(code)) {
    throw new Error("Room already exists")
  }

  const hostId = createPlayerId()
  const room: RoomRecord = {
    code,
    gameId: input.gameId,
    settings: input.settings ?? {},
    hostId,
    players: [
      {
        id: hostId,
        name: input.hostName ?? "Host",
        isHost: true,
      },
    ],
    status: "lobby",
    gameState: null,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + ROOM_TTL_MS,
  }

  rooms.set(code, room)
  return room
}

export function joinRoom(
  code: string,
  input: { playerId?: string; playerName: string },
): RoomRecord {
  pruneExpired()
  const room = getRoom(code)
  if (!room) {
    throw new Error("Room not found")
  }
  if (room.status !== "lobby") {
    throw new Error("Room is not accepting players")
  }

  const existing = input.playerId
    ? room.players.find((p) => p.id === input.playerId)
    : undefined

  if (existing) {
    existing.name = input.playerName
    room.expiresAt = Date.now() + ROOM_TTL_MS
    return room
  }

  if (room.players.length >= 8) {
    throw new Error("Room is full")
  }

  const player: RoomPlayer = {
    id: createPlayerId(),
    name: input.playerName,
    isHost: false,
  }
  room.players.push(player)
  room.expiresAt = Date.now() + ROOM_TTL_MS
  return room
}

export function startRoom(code: string, hostId: string): RoomRecord {
  const room = getRoom(code)
  if (!room) {
    throw new Error("Room not found")
  }
  if (room.hostId !== hostId) {
    throw new Error("Only the host can start the game")
  }
  if (room.players.length < 2) {
    throw new Error("Need at least 2 players")
  }
  room.status = "playing"
  room.gameState = { startedAt: new Date().toISOString() }
  room.expiresAt = Date.now() + ROOM_TTL_MS
  return room
}

export function toRoomSummary(room: RoomRecord) {
  return {
    code: room.code,
    gameId: room.gameId,
    settings: room.settings,
    hostId: room.hostId,
    players: room.players,
    createdAt: room.createdAt,
    status: room.status,
    gameState: room.gameState,
  }
}
