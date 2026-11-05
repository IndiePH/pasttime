import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useTypeRushGame } from "./use-type-rush-game"

const storageMap = new Map<string, unknown>()

const storageAdapter = {
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
}

vi.mock("@/infrastructure/storage", () => ({
  useStorage: () => storageAdapter,
}))

describe("useTypeRushGame", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  it("starts and displays the timer when the first character is typed", async () => {
    const { result } = renderHook(() => useTypeRushGame("practice"))

    await waitFor(() => expect(result.current.loadStatus).toBe("ready"))

    expect(result.current.metrics?.elapsedMs).toBe(0)

    act(() => {
      result.current.submitCharacter("x")
    })

    expect(result.current.round?.startedAt).toBeTypeOf("number")
    await waitFor(
      () => expect(result.current.metrics?.elapsedMs).toBeGreaterThan(0),
      { timeout: 1_500 }
    )
  })
})
