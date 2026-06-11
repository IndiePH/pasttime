export type AsyncStorageLike = {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
}

export interface PersistedStorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

export function createPersistedStorageAdapter(
  storage: AsyncStorageLike,
): PersistedStorageAdapter {
  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await storage.getItem(key)
      if (raw === null) {
        return null
      }
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },
    async set<T>(key: string, value: T): Promise<void> {
      await storage.setItem(key, JSON.stringify(value))
    },
    async remove(key: string): Promise<void> {
      await storage.removeItem(key)
    },
    async clear(): Promise<void> {
      await storage.clear()
    },
  }
}
