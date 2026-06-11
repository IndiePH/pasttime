import cors from "cors"
import express from "express"
import { createServer } from "node:http"
import { WebSocketServer, type WebSocket } from "ws"

import {
  createRoom,
  getRoom,
  joinRoom,
  startRoom,
  toRoomSummary,
} from "./rooms"

const PORT = Number(process.env.PORT ?? 4000)
const app = express()
const httpServer = createServer(app)

app.use(cors())
app.use(express.json())

app.use((req, _res, next) => {
  console.log(
    JSON.stringify({
      level: "info",
      event: "http_request",
      method: req.method,
      path: req.path,
      at: new Date().toISOString(),
    }),
  )
  next()
})

app.get("/health", (_req, res) => {
  res.json({ ok: true })
})

app.get("/rooms/:code", (req, res) => {
  const room = getRoom(req.params.code)
  if (!room) {
    res.status(404).json({ error: "Room not found" })
    return
  }
  res.json(toRoomSummary(room))
})

app.post("/rooms", (req, res) => {
  try {
    const { gameId, code, settings, hostName } = req.body as {
      gameId?: string
      code?: string
      settings?: Record<string, unknown>
      hostName?: string
    }
    if (!gameId) {
      res.status(400).json({ error: "gameId is required" })
      return
    }
    const room = createRoom({ gameId, code, settings, hostName })
    res.status(201).json(toRoomSummary(room))
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Could not create room",
    })
  }
})

app.post("/rooms/:code/join", (req, res) => {
  try {
    const { playerId, playerName } = req.body as {
      playerId?: string
      playerName?: string
    }
    if (!playerName?.trim()) {
      res.status(400).json({ error: "playerName is required" })
      return
    }
    const room = joinRoom(req.params.code, {
      playerId,
      playerName: playerName.trim(),
    })
    broadcastRoom(room.code)
    res.json(toRoomSummary(room))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not join"
    const status = message === "Room not found" ? 404 : 400
    res.status(status).json({ error: message })
  }
})

app.post("/rooms/:code/start", (req, res) => {
  try {
    const { hostId } = req.body as { hostId?: string }
    if (!hostId) {
      res.status(400).json({ error: "hostId is required" })
      return
    }
    const room = startRoom(req.params.code, hostId)
    broadcastRoom(room.code)
    res.json(toRoomSummary(room))
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Could not start",
    })
  }
})

type ClientMessage =
  | { type: "subscribe"; roomCode: string; playerId: string }
  | { type: "ping" }

type RoomSocket = WebSocket & { roomCode?: string; playerId?: string }

const wss = new WebSocketServer({ server: httpServer, path: "/ws" })
const roomSockets = new Map<string, Set<RoomSocket>>()

function broadcastRoom(code: string) {
  const room = getRoom(code)
  if (!room) {
    return
  }
  const payload = JSON.stringify({
    type: "room_update",
    room: toRoomSummary(room),
  })
  const sockets = roomSockets.get(code)
  if (!sockets) {
    return
  }
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) {
      socket.send(payload)
    }
  }
}

wss.on("connection", (socket: RoomSocket) => {
  socket.on("message", (raw) => {
    try {
      const message = JSON.parse(String(raw)) as ClientMessage
      if (message.type === "ping") {
        socket.send(JSON.stringify({ type: "pong" }))
        return
      }
      if (message.type === "subscribe") {
        const code = message.roomCode.toUpperCase()
        socket.roomCode = code
        socket.playerId = message.playerId
        if (!roomSockets.has(code)) {
          roomSockets.set(code, new Set())
        }
        roomSockets.get(code)?.add(socket)
        const room = getRoom(code)
        if (room) {
          socket.send(
            JSON.stringify({ type: "room_update", room: toRoomSummary(room) }),
          )
        }
      }
    } catch {
      socket.send(JSON.stringify({ type: "error", error: "Invalid message" }))
    }
  })

  socket.on("close", () => {
    if (socket.roomCode) {
      roomSockets.get(socket.roomCode)?.delete(socket)
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Pasttime API listening on http://localhost:${PORT}`)
})
