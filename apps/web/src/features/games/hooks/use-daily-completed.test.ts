import { renderHook, act } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { useDailyCompleted } from "./use-daily-completed"
import { useStorage } from "@/infrastructure/storage"
import type { StorageAdapter } from "@pasttime/storage"
import { getDailySeed } from "@pasttime/domain/daily"

vi.mock("@/infrastructure/storage", () => ({
  useStorage: vi.fn(),
}))

const todayKey = `crossword:daily:7:${getDailySeed(new Date())}`

describe("useDailyCompleted", () => {
  const mockGet = vi.fn()

  beforeEach(() => {
    const adapter: StorageAdapter = {
      get: mockGet,
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    }
    vi.mocked(useStorage).mockReturnValue(adapter)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns false when no stored state exists", () => {
    mockGet.mockReturnValue(null)
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)
  })

  it("returns false when stored state is corrupt", () => {
    mockGet.mockReturnValue({ notStatus: "won" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)
  })

  it("returns true when status is won", () => {
    mockGet.mockReturnValue({ status: "won" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(true)
  })

  it("returns true when status is lost", () => {
    mockGet.mockReturnValue({ status: "lost" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(true)
  })

  it("returns false when status is playing", () => {
    mockGet.mockReturnValue({ status: "playing" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)
  })

  it("returns false when status is abandoned", () => {
    mockGet.mockReturnValue({ status: "abandoned" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)
  })

  it("uses correct storage key", () => {
    mockGet.mockReturnValue(null)
    renderHook(() => useDailyCompleted("crossword", "7"))
    expect(mockGet).toHaveBeenCalledWith(todayKey)
  })

  it("refreshes on focus event", () => {
    mockGet.mockReturnValue({ status: "playing" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)

    mockGet.mockReturnValue({ status: "won" })
    act(() => {
      window.dispatchEvent(new Event("focus"))
    })
    expect(result.current).toBe(true)
  })

  it("refreshes on visibilitychange event", () => {
    mockGet.mockReturnValue({ status: "playing" })
    const { result } = renderHook(() => useDailyCompleted("crossword", "7"))
    expect(result.current).toBe(false)

    mockGet.mockReturnValue({ status: "won" })
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"))
    })
    expect(result.current).toBe(true)
  })
})
