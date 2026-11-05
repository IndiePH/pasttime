"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  acceptHumanMove,
  applyComputerMove,
  chooseMove,
  createComputerSession,
  flippedSquares,
  nextStep,
  setComputerDifficulty,
  type Disc,
  type Position,
  type Square,
} from "@pasttime/domain/games/reversi"

import {
  flipFrames,
  REVERSI_FLIP_MS,
  REVERSI_PLACE_MS,
  REVERSI_THINK_MS,
  type FlipMotion,
} from "./flip-frames"
import { useReversiDifficulty } from "./reversi-difficulty"
import { useReversiFlipAnimation } from "./reversi-flip-animation"
import { useReversiMatchRecorder } from "./use-reversi-match-history"

export function useReversiGame() {
  const difficulty = useReversiDifficulty()
  const animateFlips = useReversiFlipAnimation()
  const difficultyRef = useRef(difficulty)
  const animateRef = useRef(animateFlips)
  const [session, setSession] = useState(() => createComputerSession("medium"))
  const sessionRef = useRef(session)
  const flippingRef = useRef(false)
  const generation = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [shown, setShown] = useState<Disc[][] | null>(null)
  const [motion, setMotion] = useState<FlipMotion | null>(null)
  const [flippingLabel, setFlippingLabel] = useState<string | null>(null)

  useReversiMatchRecorder(session.position)

  useEffect(() => {
    difficultyRef.current = difficulty
    animateRef.current = animateFlips
  }, [animateFlips, difficulty])

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const playMove = useCallback(
    (from: Position, placed: Square, to: Position) => {
      const generationId = ++generation.current
      clearTimer()
      if (!animateRef.current) {
        flippingRef.current = false
        setShown(to.board)
        setMotion(null)
        setFlippingLabel(null)
        return
      }
      const side = from.turn
      const frames = flipFrames(
        from.board,
        placed,
        side,
        flippedSquares(from, placed),
      )
      flippingRef.current = true
      setFlippingLabel(side === "black" ? "Black is flipping" : "White is flipping")
      let index = 0
      const show = () => {
        if (generation.current !== generationId) {
          return
        }
        if (index >= frames.length) {
          flippingRef.current = false
          setShown(to.board)
          setMotion(null)
          setFlippingLabel(null)
          return
        }
        const frame = frames[index]
        if (!frame) {
          return
        }
        setShown(frame.board)
        setMotion(frame.motion)
        const wait = frame.motion.kind === "place" ? REVERSI_PLACE_MS : REVERSI_FLIP_MS
        index += 1
        timer.current = setTimeout(show, wait)
      }
      show()
    },
    [clearTimer],
  )

  useEffect(() => {
    if (flippingLabel !== null || nextStep(session).type !== "computer") {
      return
    }
    const delay = animateRef.current ? REVERSI_THINK_MS : 0
    const think = setTimeout(() => {
      const ready = setComputerDifficulty(session, difficultyRef.current)
      const step = nextStep(ready)
      if (step.type !== "computer") {
        return
      }
      const square = chooseMove(ready.position, step.difficulty)
      const next = applyComputerMove(ready, square)
      if (!next) {
        return
      }
      sessionRef.current = next
      setSession(next)
      playMove(ready.position, square, next.position)
    }, delay)
    return () => clearTimeout(think)
  }, [flippingLabel, playMove, session])

  useEffect(() => clearTimer, [clearTimer])

  const place = useCallback(
    (square: Square) => {
      if (flippingRef.current) {
        return
      }
      const current = sessionRef.current
      const next = acceptHumanMove(current, square)
      if (!next) {
        return
      }
      sessionRef.current = next
      setSession(next)
      playMove(current.position, square, next.position)
    },
    [playMove],
  )

  const newGame = useCallback(() => {
    generation.current += 1
    clearTimer()
    flippingRef.current = false
    const next = createComputerSession(difficulty)
    sessionRef.current = next
    setSession(next)
    setShown(next.position.board)
    setMotion(null)
    setFlippingLabel(null)
  }, [clearTimer, difficulty])

  return {
    session,
    board: shown ?? session.position.board,
    motion,
    flippingLabel,
    place,
    newGame,
  }
}
