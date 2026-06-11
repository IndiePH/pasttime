import type {
  PasttimeClientConfig,
  RoomSocketCallbacks,
  RoomState,
  RoomSummary,
} from "./types"

function wsUrlFromApiUrl(apiUrl: string, wsUrl?: string): string {
  if (wsUrl) {
    return wsUrl
  }
  const url = new URL(apiUrl)
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.pathname = "/ws"
  url.search = ""
  return url.toString()
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed (${response.status})`)
  }
  return body
}

export class PasttimeClient {
  private readonly apiUrl: string
  private readonly wsUrl: string

  constructor(config: PasttimeClientConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, "")
    this.wsUrl = wsUrlFromApiUrl(this.apiUrl, config.wsUrl)
  }

  async getRoom(code: string): Promise<RoomSummary | null> {
    const response = await fetch(`${this.apiUrl}/rooms/${code}`)
    if (response.status === 404) {
      return null
    }
    return parseJson<RoomSummary>(response)
  }

  async createRoom(input: {
    gameId: string
    code?: string
    settings?: Record<string, unknown>
    hostName?: string
  }): Promise<RoomSummary> {
    const response = await fetch(`${this.apiUrl}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    return parseJson<RoomSummary>(response)
  }

  async joinRoom(
    code: string,
    input: { playerId?: string; playerName: string },
  ): Promise<RoomSummary> {
    const response = await fetch(`${this.apiUrl}/rooms/${code}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    return parseJson<RoomSummary>(response)
  }

  async startRoom(code: string, hostId: string): Promise<RoomSummary> {
    const response = await fetch(`${this.apiUrl}/rooms/${code}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostId }),
    })
    return parseJson<RoomSummary>(response)
  }

  connectRoom(
    code: string,
    playerId: string,
    callbacks: RoomSocketCallbacks,
  ): () => void {
    const socket = new WebSocket(this.wsUrl)

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          type: "subscribe",
          roomCode: code,
          playerId,
        }),
      )
    })

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(String(event.data)) as {
          type: string
          room?: RoomState
          error?: string
        }
        if (message.type === "room_update" && message.room) {
          callbacks.onRoomUpdate(message.room)
        }
        if (message.type === "error" && message.error) {
          callbacks.onError?.(message.error)
        }
      } catch {
        callbacks.onError?.("Invalid server message")
      }
    })

    socket.addEventListener("close", () => {
      callbacks.onClose?.()
    })

    socket.addEventListener("error", () => {
      callbacks.onError?.("Connection error")
    })

    return () => {
      socket.close()
    }
  }
}

export function createPasttimeClient(
  config: PasttimeClientConfig,
): PasttimeClient {
  return new PasttimeClient(config)
}

export function getDefaultApiUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  return "http://localhost:4000"
}
