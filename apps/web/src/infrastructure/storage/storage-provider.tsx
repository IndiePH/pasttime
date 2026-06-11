"use client"

import * as React from "react"

import {
  createLocalStorageAdapter,
  type StorageAdapter,
} from "@pasttime/storage"

const StorageContext = React.createContext<StorageAdapter | null>(null)

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const adapter = React.useMemo(() => createLocalStorageAdapter(), [])
  return (
    <StorageContext.Provider value={adapter}>{children}</StorageContext.Provider>
  )
}

export function useStorage(): StorageAdapter {
  const adapter = React.useContext(StorageContext)
  if (!adapter) {
    throw new Error("useStorage must be used within StorageProvider")
  }
  return adapter
}
