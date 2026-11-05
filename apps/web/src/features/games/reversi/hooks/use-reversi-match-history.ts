"use client"

import { useEffect, useRef } from "react"

import {
  countDiscs,
  type Position,
  type ReversiMatch,
  type ReversiMatchResult,
} from "@pasttime/domain/games/reversi"

export const REVERSI_MATCH_HISTORY_KEY = "pasttime.reversi.matchHistory"

export function loadReversiMatches(): ReversiMatch[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const stored = window.localStorage.getItem(REVERSI_MATCH_HISTORY_KEY)
    if (!stored) {
      return []
    }
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter(isReversiMatch) : []
  } catch {
    return []
  }
}

export function saveReversiMatches(matches: ReversiMatch[]): void {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.setItem(
    REVERSI_MATCH_HISTORY_KEY,
    JSON.stringify(matches),
  )
}

export function recordReversiMatch(match: ReversiMatch): void {
  saveReversiMatches([...loadReversiMatches(), match])
}

export function useReversiMatchRecorder(position: Position): void {
  const recordedEndedMatch = useRef(false)

  useEffect(() => {
    if (position.status !== "ended") {
      recordedEndedMatch.current = false
      return
    }
    if (recordedEndedMatch.current || position.winner === null) {
      return
    }

    recordedEndedMatch.current = true
    const { black, white } = countDiscs(position)
    const result: ReversiMatchResult =
      position.winner === "black"
        ? "win"
        : position.winner === "white"
          ? "loss"
          : "draw"

    recordReversiMatch({
      blackScore: black,
      whiteScore: white,
      result,
      timestamp: Date.now(),
    })
  }, [position])
}

function isReversiMatch(value: unknown): value is ReversiMatch {
  if (!value || typeof value !== "object") {
    return false
  }
  const match = value as Partial<ReversiMatch>
  return (
    Number.isInteger(match.blackScore) &&
    Number.isInteger(match.whiteScore) &&
    typeof match.timestamp === "number" &&
    (match.result === "win" ||
      match.result === "loss" ||
      match.result === "draw")
  )
}
