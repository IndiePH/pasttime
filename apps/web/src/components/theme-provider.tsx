"use client"

import * as React from "react"

import {
  AVAILABLE_THEME_FAMILIES,
  DEFAULT_PREFERENCE,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  applyResolvedPreset,
  getSystemMode,
  isFamilyAvailable,
  modesForFamily,
  parseStoredPreference,
  resolvePreset,
  type ColorMode,
  type ModePreference,
  type ThemeFamily,
  type ThemePreference,
  type ThemePreset,
} from "@/lib/theme/presets"

/** @deprecated Prefer ModePreference — kept for callers that only care about mode. */
export type Theme = ModePreference
export type ResolvedTheme = ColorMode

type ThemeContextValue = {
  preference: ThemePreference
  /** Mode preference (light | dark | system). Alias for preference.mode. */
  theme: ModePreference
  setTheme: (mode: ModePreference) => void
  setMode: (mode: ModePreference) => void
  setFamily: (family: string) => void
  resolvedTheme: ColorMode
  resolvedMode: ColorMode
  resolvedPreset: ThemePreset
  families: readonly ThemeFamily[]
  modesForCurrentFamily: ColorMode[]
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const themeListeners = new Set<() => void>()

let cachedPreference: ThemePreference = DEFAULT_PREFERENCE
let cachedResolvedPreset: ThemePreset = resolvePreset(DEFAULT_PREFERENCE, "light")
let cachedSystemMode: ColorMode = "light"
let cacheHydrated = false

function emitThemeChange() {
  themeListeners.forEach((listener) => listener())
}

function readStoredPreference(): ThemePreference {
  try {
    const modern = localStorage.getItem(STORAGE_KEY)
    if (modern) return parseStoredPreference(modern)

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const migrated = parseStoredPreference(legacy)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      } catch {
        /* ignore */
      }
      return migrated
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_PREFERENCE
}

function writePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
  } catch {
    /* ignore */
  }
}

function applyPreference(preference: ThemePreference): ThemePreset {
  const preset = resolvePreset(preference, getSystemMode())
  applyResolvedPreset(preset)
  return preset
}

function preferencesEqual(a: ThemePreference, b: ThemePreference): boolean {
  return a.family === b.family && a.mode === b.mode
}

function syncCacheFromStorage(): void {
  const nextPreference = readStoredPreference()
  if (!preferencesEqual(nextPreference, cachedPreference)) {
    cachedPreference = nextPreference
  }

  const systemMode = getSystemMode()
  const nextPreset = resolvePreset(cachedPreference, systemMode)
  if (
    nextPreset.id !== cachedResolvedPreset.id ||
    systemMode !== cachedSystemMode
  ) {
    cachedResolvedPreset = nextPreset
    cachedSystemMode = systemMode
  }

  cacheHydrated = true
}

function updateCache(preference: ThemePreference, preset: ThemePreset): void {
  cachedPreference = preference
  cachedResolvedPreset = preset
  cachedSystemMode = getSystemMode()
  cacheHydrated = true
}

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange)

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) {
      syncCacheFromStorage()
      onStoreChange()
    }
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const onMedia = () => {
    if (cachedPreference.mode === "system" || readStoredPreference().mode === "system") {
      syncCacheFromStorage()
      applyPreference(cachedPreference)
      onStoreChange()
    }
  }

  window.addEventListener("storage", onStorage)
  media.addEventListener("change", onMedia)

  return () => {
    themeListeners.delete(onStoreChange)
    window.removeEventListener("storage", onStorage)
    media.removeEventListener("change", onMedia)
  }
}

function getPreferenceSnapshot(): ThemePreference {
  if (!cacheHydrated) {
    syncCacheFromStorage()
  }
  return cachedPreference
}

function getResolvedPresetSnapshot(): ThemePreset {
  if (!cacheHydrated) {
    syncCacheFromStorage()
  }
  return cachedResolvedPreset
}

const serverPreferenceSnapshot = DEFAULT_PREFERENCE
const serverPresetSnapshot = resolvePreset(DEFAULT_PREFERENCE, "light")

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = React.useSyncExternalStore(
    subscribeTheme,
    getPreferenceSnapshot,
    () => serverPreferenceSnapshot,
  )

  const resolvedPreset = React.useSyncExternalStore(
    subscribeTheme,
    getResolvedPresetSnapshot,
    () => serverPresetSnapshot,
  )

  const setPreference = React.useCallback((next: ThemePreference) => {
    writePreference(next)
    const preset = applyPreference(next)
    updateCache(next, preset)
    emitThemeChange()
    try {
      document.cookie = `${STORAGE_KEY}=${JSON.stringify(next)};path=/;max-age=${31536000};SameSite=Lax`
    } catch {
      /* cookie may be blocked */
    }
  }, [])

  const setMode = React.useCallback(
    (mode: ModePreference) => {
      setPreference({ ...cachedPreference, mode })
    },
    [setPreference],
  )

  const setFamily = React.useCallback(
    (family: string) => {
      if (!isFamilyAvailable(family)) return
      const current = cachedPreference
      const supported = modesForFamily(family)
      const nextMode =
        current.mode === "system"
          ? "system"
          : supported.includes(current.mode)
            ? current.mode
            : (supported[0] ?? "light")
      setPreference({ family, mode: nextMode })
    },
    [setPreference],
  )

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      preference,
      theme: preference.mode,
      setTheme: setMode,
      setMode,
      setFamily,
      resolvedTheme: resolvedPreset.mode,
      resolvedMode: resolvedPreset.mode,
      resolvedPreset,
      families: AVAILABLE_THEME_FAMILIES,
      modesForCurrentFamily: modesForFamily(preference.family),
    }),
    [preference, resolvedPreset, setMode, setFamily],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

const fallbackThemeContext: ThemeContextValue = {
  preference: DEFAULT_PREFERENCE,
  theme: "system",
  setTheme: () => {},
  setMode: () => {},
  setFamily: () => {},
  resolvedTheme: "light",
  resolvedMode: "light",
  resolvedPreset: serverPresetSnapshot,
  families: AVAILABLE_THEME_FAMILIES,
  modesForCurrentFamily: modesForFamily("default"),
}

function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  return ctx ?? fallbackThemeContext
}

export { ThemeProvider, useTheme }
export type { ThemePreference, ThemePreset, ModePreference, ColorMode }
