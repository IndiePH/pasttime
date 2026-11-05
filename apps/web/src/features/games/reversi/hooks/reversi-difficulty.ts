"use client"

import { useSyncExternalStore } from "react"

import {
  type Difficulty,
  formatDifficultyLabel,
  isDifficulty,
  REVERSI_DIFFICULTIES,
  REVERSI_DIFFICULTY_DEFAULT,
} from "@pasttime/domain/games/reversi"

const STORAGE_KEY = "pasttime.reversi.difficulty"

let current: Difficulty = REVERSI_DIFFICULTY_DEFAULT
let loaded = false
const listeners = new Set<() => void>()

function hydrate() {
  if (loaded || typeof window === "undefined") {
    return
  }
  loaded = true
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored && isDifficulty(stored)) {
    current = stored
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Difficulty {
  hydrate()
  return current
}

export function useReversiDifficulty(): Difficulty {
  return useSyncExternalStore(subscribe, getSnapshot, () => REVERSI_DIFFICULTY_DEFAULT)
}

export function setReversiDifficulty(difficulty: Difficulty) {
  hydrate()
  current = difficulty
  window.localStorage.setItem(STORAGE_KEY, difficulty)
  for (const listener of listeners) {
    listener()
  }
}

export { formatDifficultyLabel, REVERSI_DIFFICULTIES }
