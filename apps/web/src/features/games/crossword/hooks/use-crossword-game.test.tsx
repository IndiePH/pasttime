import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCrosswordGame } from "./use-crossword-game"

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

function HookHarness() {
  const game = useCrosswordGame(5, "random")

  return (
    <div>
      <p data-testid="direction">{game.direction ?? "undefined"}</p>
      <p data-testid="has-set-direction">
        {typeof game.setDirection === "function" ? "yes" : "no"}
      </p>
      <p data-testid="active-clue">
        {game.activeClue ? "has-clue" : "no-clue"}
      </p>
    </div>
  )
}

describe("useCrosswordGame — direction + activeClue", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("returns direction, setDirection, and activeClue", () => {
    render(<HookHarness />)

    expect(screen.getByTestId("direction").textContent).toBe("across")
    expect(screen.getByTestId("has-set-direction").textContent).toBe("yes")
    expect(screen.getByTestId("active-clue").textContent).toBe("no-clue")
  })
})
