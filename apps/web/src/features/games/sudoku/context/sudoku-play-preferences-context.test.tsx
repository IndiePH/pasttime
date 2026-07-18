import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  SudokuPlayPreferencesProvider,
  useSudokuPlayPreferences,
} from "./sudoku-play-preferences-context"

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

function ContextConsumer() {
  const { autoCandidates, setAutoCandidates } = useSudokuPlayPreferences()
  return (
    <div>
      <p data-testid="autoCandidates">{String(autoCandidates)}</p>
      <button onClick={() => setAutoCandidates(!autoCandidates)}>toggle</button>
    </div>
  )
}

describe("SudokuPlayPreferencesProvider", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("defaults autoCandidates to false", () => {
    render(
      <SudokuPlayPreferencesProvider>
        <ContextConsumer />
      </SudokuPlayPreferencesProvider>,
    )
    expect(screen.getByTestId("autoCandidates").textContent).toBe("false")
  })

  it("reads a previously persisted preference on mount", () => {
    storageMap.set("sudoku:play-prefs", { autoCandidates: true })
    render(
      <SudokuPlayPreferencesProvider>
        <ContextConsumer />
      </SudokuPlayPreferencesProvider>,
    )
    expect(screen.getByTestId("autoCandidates").textContent).toBe("true")
  })

  it("setAutoCandidates updates the value and persists via the domain write function", () => {
    render(
      <SudokuPlayPreferencesProvider>
        <ContextConsumer />
      </SudokuPlayPreferencesProvider>,
    )

    act(() => {
      screen.getByText("toggle").click()
    })

    expect(screen.getByTestId("autoCandidates").textContent).toBe("true")
    expect(storageMap.get("sudoku:play-prefs")).toEqual({ autoCandidates: true })
  })

  it("throws when used outside the provider", () => {
    expect(() => render(<ContextConsumer />)).toThrow(
      /useSudokuPlayPreferences must be used inside SudokuPlayPreferencesProvider/,
    )
  })
})
