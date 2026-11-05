"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "pasttime.reversi.flipAnimation"

let current = true
let loaded = false
const listeners = new Set<() => void>()

function hydrate() {
  if (loaded || typeof window === "undefined") {
    return
  }
  loaded = true
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "on") {
    current = true
  } else if (stored === "off") {
    current = false
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): boolean {
  hydrate()
  return current
}

export function useReversiFlipAnimation(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}

export function setReversiFlipAnimation(enabled: boolean) {
  hydrate()
  current = enabled
  window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off")
  for (const listener of listeners) {
    listener()
  }
}
