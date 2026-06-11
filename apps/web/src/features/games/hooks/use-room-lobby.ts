"use client"

import * as React from "react"

import type { RoomState } from "@pasttime/api-client"
import { pasttimeClient } from "@/lib/pasttime-client"

const PLAYER_ID_KEY = "pasttime:player-id"
const PLAYER_NAME_KEY = "pasttime:player-name"

function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") {
    return ""
  }
  const existing = window.localStorage.getItem(PLAYER_ID_KEY)
  if (existing) {
    return existing
  }
  const id = crypto.randomUUID()
  window.localStorage.setItem(PLAYER_ID_KEY, id)
  return id
}

function getPlayerName(): string {
  if (typeof window === "undefined") {
    return "Player"
  }
  return window.localStorage.getItem(PLAYER_NAME_KEY) ?? "You"
}

export function useRoomLobby(roomCode: string, gameId: string) {
  const [room, setRoom] = React.useState<RoomState | null>(null)
  const [playerId, setPlayerId] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [syncConnected, setSyncConnected] = React.useState(false)

  React.useEffect(() => {
    let disconnect: (() => void) | undefined
    let cancelled = false

    async function sync() {
      const id = getOrCreatePlayerId()
      setPlayerId(id)
      const name = getPlayerName()

      try {
        let nextRoom = await pasttimeClient.getRoom(roomCode)
        if (!nextRoom) {
          nextRoom = await pasttimeClient.createRoom({
            gameId,
            code: roomCode,
            hostName: name,
          })
        } else {
          nextRoom = await pasttimeClient.joinRoom(roomCode, {
            playerId: id,
            playerName: name,
          })
        }

        if (cancelled) {
          return
        }

        setRoom(nextRoom)
        setLoading(false)

        disconnect = pasttimeClient.connectRoom(roomCode, id, {
          onRoomUpdate: (updated) => {
            setRoom(updated)
            setSyncConnected(true)
          },
          onError: (message) => setError(message),
          onClose: () => setSyncConnected(false),
        })
        setSyncConnected(true)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not join room")
          setLoading(false)
        }
      }
    }

    void sync()

    return () => {
      cancelled = true
      disconnect?.()
    }
  }, [roomCode, gameId])

  const isHost = room?.hostId === playerId

  async function startGame() {
    if (!room || !isHost) {
      return
    }
    setError(null)
    try {
      const updated = await pasttimeClient.startRoom(room.code, playerId)
      setRoom(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start game")
    }
  }

  return {
    room,
    playerId,
    loading,
    error,
    syncConnected,
    isHost,
    startGame,
  }
}
