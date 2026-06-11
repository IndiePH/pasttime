"use client"

import * as React from "react"

const STORAGE_KEY = "theme"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ResolvedTheme
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const themeListeners = new Set<() => void>()

function emitThemeChange() {
  themeListeners.forEach((listener) => listener())
}

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange)

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange()
    }
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const onMedia = () => {
    if (readStoredTheme() === "system") {
      applyTheme("system")
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

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function applyTheme(theme: Theme): ResolvedTheme {
  const resolved = resolveTheme(theme)
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
  return resolved
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored
    }
  } catch {
    /* ignore */
  }
  return "system"
}

function getThemeSnapshot(): Theme {
  return readStoredTheme()
}

function getResolvedSnapshot(): ResolvedTheme {
  return resolveTheme(readStoredTheme())
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore<Theme>(
    subscribeTheme,
    getThemeSnapshot,
    () => "system",
  )

  const resolvedTheme = React.useSyncExternalStore<ResolvedTheme>(
    subscribeTheme,
    getResolvedSnapshot,
    () => "light",
  )

  const setTheme = React.useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    applyTheme(next)
    emitThemeChange()
  }, [])

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

const fallbackThemeContext: ThemeContextValue = {
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
}

function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  return ctx ?? fallbackThemeContext
}

export { ThemeProvider, useTheme }
