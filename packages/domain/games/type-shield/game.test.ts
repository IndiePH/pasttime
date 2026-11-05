import { describe, expect, it } from "vitest"

import { getTypingCharacterStatus } from "../shared/typing"

import {
  getTypeShieldFallMs,
  getTypeShieldSpawnGap,
  getTypeShieldWpm,
  TYPE_SHIELD_NIGHTMARE_RAMP_MS,
  type TypeShieldDifficulty,
} from "./difficulty"
import { TYPE_SHIELD_SURVIVAL_MS } from "./mode"
import {
  advanceTypeShield,
  backspaceTypeShieldCharacter,
  createTypeShieldRound,
  getTypeShieldLockedComet,
  submitTypeShieldCharacter,
  TYPE_SHIELD_MAX_LIVES,
} from "./game"

const NOW = 1_700_000_000_000
const WORDS = ["amber", "apple", "arrow"] as const

function start() {
  return createTypeShieldRound({ now: NOW, seed: 4, words: WORDS })
}

describe("createTypeShieldRound", () => {
  it("opens with one falling comet and full lives", () => {
    const state = start()
    expect(state.lives).toBe(TYPE_SHIELD_MAX_LIVES)
    expect(state.mode).toBe("survival")
    expect(state.comets).toHaveLength(1)
    expect(state.comets[0]?.typing.cursor).toBe(0)
    expect(WORDS).toContain(state.comets[0]?.word)
  })
})

describe("submitTypeShieldCharacter", () => {
  it("destroys a comet when its word is typed and scores by length", () => {
    let state = start()
    const word = state.comets[0]?.word ?? ""

    for (const character of word) {
      state = submitTypeShieldCharacter(state, character, NOW + 20)
    }

    expect(state.destroyed).toBe(1)
    expect(state.score).toBe(word.length * 10)
    expect(state.comets).toHaveLength(0)
  })

  it("ignores a letter that matches no falling word", () => {
    const state = start()
    expect(submitTypeShieldCharacter(state, "z", NOW)).toBe(state)
  })

  it("highlights a shared prefix on every matching comet, then locks the one that still fits", () => {
    let state = createTypeShieldRound({
      now: NOW,
      seed: 4,
      words: ["metric", "meteor"],
    })
    state = advanceTypeShield(state, state.nextSpawnAt)
    expect(state.comets.map((comet) => comet.word).sort()).toEqual([
      "meteor",
      "metric",
    ])

    for (const character of "met") {
      state = submitTypeShieldCharacter(state, character, NOW + 500)
    }

    expect(state.comets.map((comet) => comet.typing.cursor)).toEqual([3, 3])
    for (const comet of state.comets) {
      expect(["m", "e", "t"].map((_, index) => getTypingCharacterStatus(comet.typing, index))).toEqual([
        "correct",
        "correct",
        "correct",
      ])
    }
    expect(getTypeShieldLockedComet(state)).toBeNull()

    const diverged = submitTypeShieldCharacter(state, "r", NOW + 600)
    expect(diverged.comets.find((comet) => comet.word === "metric")?.typing.cursor).toBe(4)
    expect(diverged.comets.find((comet) => comet.word === "meteor")?.typing.cursor).toBe(0)
    expect(getTypeShieldLockedComet(diverged)?.word).toBe("metric")

    const restored = backspaceTypeShieldCharacter(diverged)
    expect(restored.comets.map((comet) => comet.typing.cursor)).toEqual([3, 3])
    expect(getTypeShieldLockedComet(restored)).toBeNull()
  })

  it("undoes the last typed letter", () => {
    let state = submitTypeShieldCharacter(start(), "a", NOW)
    expect(getTypeShieldLockedComet(state)?.typing.cursor).toBe(1)
    state = backspaceTypeShieldCharacter(state)
    expect(getTypeShieldLockedComet(state)).toBeNull()
  })
})

describe("getTypeShieldFallMs", () => {
  it("gives shorter words less time to reach the dome", () => {
    const wpm = getTypeShieldWpm("easy", 0)
    const short = getTypeShieldFallMs(3, wpm)
    const long = getTypeShieldFallMs(6, wpm)

    expect(long).toBe(short * 2)
    expect(short).toBeLessThan(long)
  })

  it("keeps a short comet ahead of a long one spawned on the same pace", () => {
    const short = createTypeShieldRound({
      now: NOW,
      seed: 1,
      words: ["comet"],
    })
    const long = createTypeShieldRound({
      now: NOW,
      seed: 1,
      words: ["meteor"],
    })

    expect(short.comets[0]?.fallMs).toBeLessThan(long.comets[0]?.fallMs ?? 0)
  })

  it("demands a faster pace on each difficulty above easy", () => {
    const wordLength = 5
    const easy = getTypeShieldFallMs(wordLength, getTypeShieldWpm("easy", 0))
    const medium = getTypeShieldFallMs(wordLength, getTypeShieldWpm("medium", 0))
    const hard = getTypeShieldFallMs(wordLength, getTypeShieldWpm("hard", 0))
    const nightmare = getTypeShieldFallMs(
      wordLength,
      getTypeShieldWpm("nightmare", 0),
    )

    expect(getTypeShieldWpm("easy", 0)).toBe(25)
    expect(getTypeShieldWpm("medium", 0)).toBe(46)
    expect(getTypeShieldWpm("hard", 0)).toBe(66)
    expect(nightmare).toBeLessThan(hard)
    expect(hard).toBeLessThan(medium)
    expect(medium).toBeLessThan(easy)
  })

  it("ramps nightmare from 76 to 150 wpm every few seconds", () => {
    expect(getTypeShieldWpm("nightmare", 0)).toBe(76)
    expect(getTypeShieldWpm("nightmare", TYPE_SHIELD_NIGHTMARE_RAMP_MS)).toBe(87)
    expect(getTypeShieldWpm("nightmare", TYPE_SHIELD_NIGHTMARE_RAMP_MS * 7)).toBe(
      150,
    )
    expect(getTypeShieldWpm("nightmare", TYPE_SHIELD_NIGHTMARE_RAMP_MS * 20)).toBe(
      150,
    )
    expect(getTypeShieldWpm("easy", TYPE_SHIELD_NIGHTMARE_RAMP_MS * 10)).toBe(25)
  })
})

describe("survival", () => {
  it("is won by lasting 2 minutes with the shield still up", () => {
    const state = createTypeShieldRound({
      now: NOW,
      seed: 4,
      words: WORDS,
      mode: "survival",
    })
    const next = advanceTypeShield(
      { ...state, comets: [] },
      state.startedAt + TYPE_SHIELD_SURVIVAL_MS,
    )

    expect(TYPE_SHIELD_SURVIVAL_MS).toBe(120_000)
    expect(next.status).toBe("won")
    expect(next.comets).toHaveLength(0)
  })

  it("keeps playing before the 2 minutes are up", () => {
    const state = createTypeShieldRound({
      now: NOW,
      seed: 4,
      words: WORDS,
      mode: "survival",
    })
    const next = advanceTypeShield(
      { ...state, comets: [] },
      state.startedAt + TYPE_SHIELD_SURVIVAL_MS - 1,
    )

    expect(next.status).toBe("playing")
  })

  it("loses when the shield falls before 2 minutes", () => {
    const state = createTypeShieldRound({
      now: NOW,
      seed: 4,
      words: WORDS,
      mode: "survival",
    })
    const comet = state.comets[0]
    const deadline = state.startedAt + TYPE_SHIELD_SURVIVAL_MS
    const next = advanceTypeShield(
      {
        ...state,
        lives: 1,
        comets: comet
          ? [{ ...comet, spawnedAt: deadline - comet.fallMs }]
          : [],
      },
      deadline,
    )

    expect(next.status).toBe("lost")
  })

  it("does not end an endless round at 2 minutes", () => {
    const state = createTypeShieldRound({
      now: NOW,
      seed: 4,
      words: WORDS,
      mode: "endless",
    })
    const next = advanceTypeShield(
      { ...state, comets: [] },
      state.startedAt + TYPE_SHIELD_SURVIVAL_MS,
    )

    expect(next.status).toBe("playing")
  })
})

const ROSTER = Array.from({ length: 12 }, (_, index) =>
  `${String.fromCharCode(97 + index)}aaaa`,
)

function openingCounts(difficulty: TypeShieldDifficulty, samples: number) {
  const counts = { solo: 0, pair: 0, triple: 0, over: 0 }
  for (let seed = 1; seed <= samples; seed += 1) {
    const size = createTypeShieldRound({
      now: NOW,
      seed,
      words: ROSTER,
      difficulty,
      mode: "endless",
    }).comets.length
    if (size === 1) counts.solo += 1
    else if (size === 2) counts.pair += 1
    else if (size === 3) counts.triple += 1
    else counts.over += 1
  }
  return counts
}

describe("comet bursts", () => {
  it("keeps easy to one comet and caps the other difficulties", () => {
    const easy = openingCounts("easy", 200)
    const medium = openingCounts("medium", 800)
    const hard = openingCounts("hard", 800)
    const nightmare = openingCounts("nightmare", 800)

    expect(easy.pair + easy.triple + easy.over).toBe(0)
    expect(medium.triple + medium.over).toBe(0)
    expect(medium.pair).toBeGreaterThan(0)
    expect(medium.pair).toBeLessThan(200)
    expect(hard.over).toBe(0)
    expect(hard.pair + hard.triple).toBeGreaterThan(0)
    expect(nightmare.pair + nightmare.triple).toBeGreaterThan(
      medium.pair + medium.triple,
    )
  })

  it("shares the typing pace across a spawned group", () => {
    let grouped = null as ReturnType<typeof createTypeShieldRound> | null
    for (let seed = 1; seed <= 400; seed += 1) {
      const state = createTypeShieldRound({
        now: NOW,
        seed,
        words: ROSTER,
        difficulty: "medium",
        mode: "endless",
      })
      if (state.comets.length === 2) {
        grouped = state
        break
      }
    }

    expect(grouped).not.toBeNull()
    const letters = grouped!.comets.reduce((sum, comet) => sum + comet.word.length, 0)
    const wpm = getTypeShieldWpm("medium", 0)
    const sharedFall = getTypeShieldFallMs(letters, wpm)

    expect(grouped!.comets[0]?.fallMs).toBe(sharedFall)
    expect(grouped!.comets[1]?.fallMs).toBe(sharedFall)
    expect(sharedFall).toBeGreaterThan(
      getTypeShieldFallMs(grouped!.comets[0]?.word.length ?? 1, wpm),
    )
    expect(grouped!.nextSpawnAt - NOW).toBe(getTypeShieldSpawnGap(letters, wpm))
  })
})

describe("advanceTypeShield", () => {
  it("removes a life when a comet reaches the dome", () => {
    const state = start()
    const comet = state.comets[0]
    const next = advanceTypeShield(
      state,
      (comet?.spawnedAt ?? NOW) + (comet?.fallMs ?? 0)
    )
    expect(next.lives).toBe(TYPE_SHIELD_MAX_LIVES - 1)
    expect(next.comets.some((entry) => entry.id === comet?.id)).toBe(false)
  })

  it("ends the round when the last life is lost", () => {
    let state = start()
    let guard = 0
    while (state.status === "playing" && guard < 20) {
      const impactAt = Math.min(
        ...state.comets.map((comet) => comet.spawnedAt + comet.fallMs)
      )
      state = advanceTypeShield(state, impactAt)
      guard += 1
    }

    expect(state.status).toBe("lost")
    expect(state.lives).toBe(0)
    expect(state.comets).toHaveLength(0)
    expect(advanceTypeShield(state, state.nextSpawnAt + 10_000)).toBe(state)
  })
})
