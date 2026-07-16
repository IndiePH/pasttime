import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  CrosswordPlayPreferencesProvider,
  useCrosswordPlayPreferences,
} from "./crossword-play-preferences-context"

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
  const ctx = useCrosswordPlayPreferences() as unknown as Record<
    string,
    unknown
  >
  return (
    <div>
      <p data-testid="showErrors">{String(ctx.showErrors)}</p>
      <p data-testid="autoCheck">{String(ctx.autoCheck)}</p>
      <p data-testid="showWordSpanHighlight">
        {String(ctx.showWordSpanHighlight)}
      </p>
      <p data-testid="showCornerArrowGlyph">
        {String(ctx.showCornerArrowGlyph)}
      </p>
      <p data-testid="showDirectionBorderColor">
        {String(ctx.showDirectionBorderColor)}
      </p>
      <p data-testid="blinkActiveClue">{String(ctx.blinkActiveClue)}</p>
    </div>
  )
}

describe("CrosswordPlayPreferencesProvider extension", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("provides the 4 direction-indicator toggles with defaults", () => {
    render(
      <CrosswordPlayPreferencesProvider>
        <ContextConsumer />
      </CrosswordPlayPreferencesProvider>,
    )

    expect(screen.getByTestId("showWordSpanHighlight").textContent).toBe(
      "true",
    )
    expect(screen.getByTestId("showCornerArrowGlyph").textContent).toBe("true")
    expect(screen.getByTestId("showDirectionBorderColor").textContent).toBe(
      "true",
    )
    expect(screen.getByTestId("blinkActiveClue").textContent).toBe("true")
  })
})
