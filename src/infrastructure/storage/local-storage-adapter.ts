import type { StorageAdapter } from "./types"

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage
}

export function createLocalStorageAdapter(): StorageAdapter {
  return {
    get<T>(key: string): T | null {
      const storage = getStorage()
      if (!storage) {
        return null
      }
      const raw = storage.getItem(key)
      if (raw === null) {
        return null
      }
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },
    set<T>(key: string, value: T): void {
      const storage = getStorage()
      if (!storage) {
        return
      }
      storage.setItem(key, JSON.stringify(value))
    },
    remove(key: string): void {
      getStorage()?.removeItem(key)
    },
    clear(): void {
      getStorage()?.clear()
    },
  }
}
