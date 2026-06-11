import { useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"

import type { RoomState } from "@pasttime/api-client"
import { getGameById } from "@pasttime/domain/games"
import { pasttimeClient } from "@/lib/api"
import { mobileStorage } from "@/lib/storage"

const PLAYER_ID_KEY = "pasttime:mobile:player-id"

async function getPlayerId(): Promise<string> {
  const existing = await mobileStorage.get<string>(PLAYER_ID_KEY)
  if (existing) {
    return existing
  }
  const id = crypto.randomUUID()
  await mobileStorage.set(PLAYER_ID_KEY, id)
  return id
}

export default function RoomScreen() {
  const { slug, code } = useLocalSearchParams<{ slug: string; code: string }>()
  const game = getGameById(slug ?? "")
  const roomCode = (code ?? "").toUpperCase()
  const [room, setRoom] = useState<RoomState | null>(null)
  const [playerId, setPlayerId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!game || !roomCode) {
      return
    }

    let disconnect: (() => void) | undefined
    let cancelled = false

    void (async () => {
      try {
        const id = await getPlayerId()
        setPlayerId(id)

        let nextRoom = await pasttimeClient.getRoom(roomCode)
        if (!nextRoom) {
          nextRoom = await pasttimeClient.createRoom({
            gameId: game.id,
            code: roomCode,
            hostName: "Mobile player",
          })
        } else {
          nextRoom = await pasttimeClient.joinRoom(roomCode, {
            playerId: id,
            playerName: "Mobile player",
          })
        }

        if (cancelled) {
          return
        }

        setRoom(nextRoom)
        setLoading(false)

        disconnect = pasttimeClient.connectRoom(roomCode, id, {
          onRoomUpdate: setRoom,
          onError: (message) => setError(message),
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not join room")
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
      disconnect?.()
    }
  }, [game, roomCode])

  const isHost = room?.hostId === playerId

  async function handleStart() {
    if (!room || !isHost) {
      return
    }
    try {
      const updated = await pasttimeClient.startRoom(room.code, playerId)
      setRoom(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start")
    }
  }

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{game.title} room</Text>
      <Text style={styles.code}>{roomCode}</Text>

      {loading ? <ActivityIndicator color="#fafafa" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {room ? (
        <>
          <Text style={styles.meta}>
            {room.players.length} player{room.players.length === 1 ? "" : "s"}
          </Text>
          {room.players.map((player) => (
            <Text key={player.id} style={styles.player}>
              {player.name}
              {player.isHost ? " (host)" : ""}
            </Text>
          ))}
          {isHost && room.status === "lobby" ? (
            <Pressable style={styles.button} onPress={() => void handleStart()}>
              <Text style={styles.buttonText}>Start game</Text>
            </Pressable>
          ) : null}
          {room.status === "playing" ? (
            <Text style={styles.meta}>Game in progress</Text>
          ) : null}
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0a0a0a",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fafafa",
  },
  code: {
    marginTop: 12,
    fontSize: 32,
    fontFamily: "monospace",
    letterSpacing: 6,
    color: "#fafafa",
  },
  meta: {
    marginTop: 16,
    color: "#a3a3a3",
  },
  player: {
    marginTop: 8,
    color: "#fafafa",
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#0a0a0a",
    fontWeight: "600",
  },
  error: {
    marginTop: 12,
    color: "#f87171",
  },
})
