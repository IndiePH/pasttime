import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createKlondikeGame,
  getKlondikeStorageKey,
  klondikeDailySeed,
  type KlondikeState,
} from "@pasttime/domain/games/solitaire"

import { useKlondikeGame } from "./use-klondike-game"

const storageMap = new Map<string, unknown>()

vi.mock("@/infrastructure/storage", () => {
  return {
    useStorage: () => ({
      get: <T,>(key: string) => (storageMap.get(key) as T) ?? null,
      set: <T,>(key: string, value: T) => {
        storageMap.set(key, value)
      },
      remove: (key: string) => {
        storageMap.delete(key)
      },
      clear: () => {
        storageMap.clear()
      },
    }),
  }
})

vi.mock(
  "@/features/games/solitaire/context/solitaire-play-preferences-context",
  () => ({
    useSolitairePlayPreferencesContext: () => ({
      cardVariant: "classic",
      setCardVariant: () => {},
      autoStackEnabled: false,
      setAutoStackEnabled: () => {},
    }),
  }),
)

function boardSignature(state: KlondikeState): string {
  return [
    ...state.tableau.flatMap((column) => column.map((card) => card.id)),
    ...state.stock.map((card) => card.id),
  ].join(",")
}

async function mountReady(drawCount: 1 | 3, round: "daily" | "random") {
  const hook = renderHook(() => useKlondikeGame(drawCount, round))
  await waitFor(() => expect(hook.result.current.loadStatus).toBe("ready"))
  return hook
}

describe("useKlondikeGame daily and random deals", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  it("deals today's seeded board and stores it on the daily key", async () => {
    const { result } = await mountReady(1, "daily")
    const seed = klondikeDailySeed(new Date(), 1)
    const expected = createKlondikeGame({ seed, drawCount: 1 })
    const key = getKlondikeStorageKey("klondike-draw1", "daily")

    expect(result.current.state.seed).toBe(seed)
    expect(boardSignature(result.current.state)).toBe(boardSignature(expected))
    expect(storageMap.has(key)).toBe(true)
    expect(storageMap.has("solitaire:klondike:session")).toBe(false)
    expect((storageMap.get(key) as KlondikeState).status).toBe("playing")
  })

  it("resumes the same daily board on a second load", async () => {
    const first = await mountReady(1, "daily")
    const opening = boardSignature(first.result.current.state)
    const key = getKlondikeStorageKey("klondike-draw1", "daily")
    const saved = storageMap.get(key) as KlondikeState
    first.unmount()
    storageMap.set(key, { ...saved, moves: 9 })

    const second = await mountReady(1, "daily")
    expect(boardSignature(second.result.current.state)).toBe(opening)
    expect(second.result.current.state.moves).toBe(9)
    expect(second.result.current.state.seed).toBe(klondikeDailySeed(new Date(), 1))
  })

  it("keeps a won daily instead of dealing again", async () => {
    const seed = klondikeDailySeed(new Date(), 1)
    const won = {
      ...createKlondikeGame({ seed, drawCount: 1 }),
      status: "won" as const,
      moves: 120,
    }
    storageMap.set(getKlondikeStorageKey("klondike-draw1", "daily"), won)

    const { result } = await mountReady(1, "daily")
    expect(result.current.state.status).toBe("won")
    expect(result.current.state.moves).toBe(120)
    expect(boardSignature(result.current.state)).toBe(boardSignature(won))
  })

  it("deals a different board for draw 3 on the same day", async () => {
    const draw1 = await mountReady(1, "daily")
    const draw3 = await mountReady(3, "daily")

    expect(draw3.result.current.state.seed).not.toBe(draw1.result.current.state.seed)
    expect(boardSignature(draw3.result.current.state)).not.toBe(
      boardSignature(draw1.result.current.state),
    )
    expect(storageMap.has(getKlondikeStorageKey("klondike-draw1", "daily"))).toBe(
      true,
    )
    expect(storageMap.has(getKlondikeStorageKey("klondike-draw3", "daily"))).toBe(
      true,
    )
  })

  it("stores a random deal apart from today's daily", async () => {
    const daily = await mountReady(1, "daily")
    const dailyKey = getKlondikeStorageKey("klondike-draw1", "daily")
    const saved = storageMap.get(dailyKey)
    const dailyBoard = boardSignature(daily.result.current.state)
    daily.unmount()

    const random = await mountReady(1, "random")
    expect(random.result.current.state.seed).toBeNull()
    expect(boardSignature(random.result.current.state)).not.toBe(dailyBoard)
    expect(storageMap.get(dailyKey)).toEqual(saved)
    expect(storageMap.has(getKlondikeStorageKey("klondike-draw1", "random"))).toBe(
      true,
    )
  })

  it("replaces a stored daily whose seed is not today's", async () => {
    const key = getKlondikeStorageKey("klondike-draw1", "daily")
    storageMap.set(key, createKlondikeGame({ seed: 123, drawCount: 1 }))

    const { result } = await mountReady(1, "daily")
    expect(result.current.state.seed).toBe(klondikeDailySeed(new Date(), 1))
  })

  it("deals a new unseeded board from New game in random mode", async () => {
    const random = vi.spyOn(Math, "random")
    let n = 0
    random.mockImplementation(() => {
      n += 1
      return (n % 11) / 11
    })

    const { result } = await mountReady(1, "random")
    const firstBoard = boardSignature(result.current.state)

    act(() => {
      result.current.newGame()
    })

    expect(result.current.state.seed).toBeNull()
    expect(boardSignature(result.current.state)).not.toBe(firstBoard)
    random.mockRestore()
  })
})

const COMPLETIONS_KEY = "solitaire:daily:completions"

function pile(suit: "club" | "diamond" | "heart" | "spade", count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${suit}-${index + 1}`,
    suit,
    rank: index + 1,
    faceUp: true,
  }))
}

function nearWin(drawCount: 1 | 3, seed: number | null): KlondikeState {
  return {
    stock: [],
    waste: [{ id: "spade-13", suit: "spade", rank: 13, faceUp: true }],
    foundations: [
      pile("club", 13),
      pile("diamond", 13),
      pile("heart", 13),
      pile("spade", 12),
    ],
    tableau: [
      [{ id: "held", suit: "club", rank: 2, faceUp: false }],
      [],
      [],
      [],
      [],
      [],
      [],
    ],
    status: "playing",
    moves: 40,
    seed,
    drawCount,
    elapsedMs: 65_000,
    startedAt: Date.now(),
  }
}

type StoredCompletion = {
  date: string
  status: string
  variant: string
  moves?: number
  time?: number
}

function storedCompletions(): StoredCompletion[] {
  return (storageMap.get(COMPLETIONS_KEY) as StoredCompletion[] | undefined) ?? []
}

async function winStoredDeal(drawCount: 1 | 3, round: "daily" | "random") {
  const layout = drawCount === 3 ? "klondike-draw3" : "klondike-draw1"
  const seed = round === "daily" ? klondikeDailySeed(new Date(), drawCount) : null
  storageMap.set(
    getKlondikeStorageKey(layout, round),
    nearWin(drawCount, seed),
  )
  const hook = await mountReady(drawCount, round)
  act(() => {
    hook.result.current.moveCards({ pile: "waste" }, 1, {
      pile: "foundation",
      index: 3,
    })
  })
  return hook
}

describe("useKlondikeGame daily win recording", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  it("records one daily completion with moves and does not duplicate it", async () => {
    const { result, rerender } = await winStoredDeal(1, "daily")
    await waitFor(() => expect(storedCompletions()).toHaveLength(1))

    const [completion] = storedCompletions()
    expect(completion?.status).toBe("won")
    expect(completion?.variant).toBe("klondike-draw1")
    expect(completion?.moves).toBe(result.current.state.moves)
    expect(typeof completion?.time).toBe("number")

    rerender()
    expect(storedCompletions()).toHaveLength(1)
  })

  it("does not record a random win", async () => {
    const { result } = await winStoredDeal(1, "random")
    expect(result.current.state.status).toBe("won")
    expect(storageMap.has(COMPLETIONS_KEY)).toBe(false)
  })

  it("keeps one streak day when both draw modes are won on the same date", async () => {
    await winStoredDeal(1, "daily")
    await waitFor(() => expect(storedCompletions()).toHaveLength(1))
    await winStoredDeal(3, "daily")
    await waitFor(() => expect(storedCompletions()).toHaveLength(1))

    const dates = new Set(storedCompletions().map((item) => item.date))
    expect(dates.size).toBe(1)
    expect(storedCompletions()[0]?.variant).toBe("klondike-draw3")
  })
})
