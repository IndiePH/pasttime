"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "pasttime.type-rush.backspace"

let allowBackspace = true
let loaded = false
const listeners = new Set<() => void>()

function hydrate() {
  if (loaded || typeof window === "undefined") {
    return
  }
  loaded = true
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "off") {
    allowBackspace = false
  } else if (stored === "on") {
    allowBackspace = true
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): boolean {
  hydrate()
  return allowBackspace
}

export function useTypeRushBackspace(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}

export function setTypeRushBackspace(allowed: boolean) {
  hydrate()
  allowBackspace = allowed
  window.localStorage.setItem(STORAGE_KEY, allowed ? "on" : "off")
  for (const listener of listeners) {
    listener()
  }
}
