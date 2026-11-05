import { applyMove, createPosition } from "./position"
import type { Difficulty, NextStep, Seat, Session, Side, Square } from "./types"

export function createSession(seats: Record<Side, Seat>): Session {
  return {
    position: createPosition(),
    seats: { black: seats.black, white: seats.white },
  }
}

export function createHotseatSession(): Session {
  return createSession({
    black: { kind: "human" },
    white: { kind: "human" },
  })
}

export function createComputerSession(difficulty: Difficulty): Session {
  return createSession({
    black: { kind: "human" },
    white: { kind: "computer", difficulty },
  })
}

export function setComputerDifficulty(
  session: Session,
  difficulty: Difficulty,
): Session {
  const seats: Record<Side, Seat> = { ...session.seats }
  for (const side of ["black", "white"] as const) {
    if (seats[side].kind === "computer") {
      seats[side] = { kind: "computer", difficulty }
    }
  }
  return { position: session.position, seats }
}

export function acceptHumanMove(
  session: Session,
  square: Square,
): Session | null {
  return moveForSeat(session, square, "human")
}

export function applyComputerMove(
  session: Session,
  square: Square,
): Session | null {
  return moveForSeat(session, square, "computer")
}

export function nextStep(session: Session): NextStep {
  if (session.position.status === "ended") {
    return { type: "ended" }
  }
  const seat = session.seats[session.position.turn]
  if (seat.kind === "computer") {
    return {
      type: "computer",
      side: session.position.turn,
      difficulty: seat.difficulty,
    }
  }
  return { type: "human" }
}

function moveForSeat(
  session: Session,
  square: Square,
  kind: Seat["kind"],
): Session | null {
  const seat = session.seats[session.position.turn]
  if (seat.kind !== kind) {
    return null
  }
  const position = applyMove(session.position, square)
  if (!position) {
    return null
  }
  return { position, seats: session.seats }
}
