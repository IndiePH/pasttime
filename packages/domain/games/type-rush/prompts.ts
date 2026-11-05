import { getDailySeed, hashSeed } from "../../daily"

import {
  TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  type TypeRushContentType,
  type TypeRushRoundMode,
} from "./settings"

export type TypeRushPrompt = {
  id: string
  text: string
}

const TYPE_RUSH_PARAGRAPH_PACKS = [
  {
    id: "steady-start",
    sentences: [
      "A steady start gives your hands time to find the rhythm of the keyboard.",
      "Once the rhythm feels familiar, your fingers can move with less hesitation.",
      "That calm focus helps you notice mistakes without letting them interrupt the run.",
      "Each careful correction builds confidence for the next line.",
      "By the final sentence, speed feels like the result of practice rather than pressure.",
    ],
  },
  {
    id: "small-steps",
    sentences: [
      "Small steps turn a difficult skill into a routine you can repeat.",
      "A short practice session gives you one clear target to work on.",
      "The next session becomes easier when you remember what improved last time.",
      "Gradual progress keeps effort useful even when the result is not perfect.",
      "Over time, those small gains add up to a pace that feels natural.",
    ],
  },
  {
    id: "clear-focus",
    sentences: [
      "Clear focus begins by giving one task your full attention.",
      "When distractions fall away, each keystroke becomes easier to judge.",
      "A measured pace leaves room to correct errors before they grow.",
      "That control makes it easier to stay composed through a longer passage.",
      "With enough repetition, concentration becomes part of the motion.",
    ],
  },
  {
    id: "quiet-practice",
    sentences: [
      "Quiet practice creates space to hear the pattern of your own typing.",
      "Without the pressure to rush, you can learn which movements feel awkward.",
      "Repeating those movements slowly gives your hands a better memory.",
      "The memory remains when you increase the pace a little at a time.",
      "Eventually, the work feels smooth because the foundation is reliable.",
    ],
  },
  {
    id: "keep-moving",
    sentences: [
      "Mistakes are easier to manage when the next character is already in view.",
      "Keeping your attention on the sentence prevents one error from shaping the whole run.",
      "A steady recovery protects your rhythm and keeps the session moving.",
      "Every recovered mistake becomes a small lesson in staying present.",
      "That habit makes future passages feel lighter and more forgiving.",
    ],
  },
] as const

export const TYPE_RUSH_PROMPTS: readonly TypeRushPrompt[] =
  TYPE_RUSH_PARAGRAPH_PACKS.map((pack) => ({
    id: pack.id,
    text: pack.sentences.join(" "),
  }))

const TYPE_RUSH_WORDS = [
  "bright",
  "careful",
  "steady",
  "motion",
  "focus",
  "practice",
  "rhythm",
  "signal",
  "quick",
  "silver",
  "forest",
  "window",
  "rocket",
  "canvas",
  "simple",
  "future",
  "gentle",
  "energy",
  "around",
  "forward",
] as const

const CONTENT_TYPE_SEED_OFFSETS: Record<TypeRushContentType, number> = {
  paragraph: 0,
  words: 101,
  numbers: 211,
  "numbers-punctuation": 307,
}

function createSeededRandom(seed: number): () => number {
  let state = hashSeed(seed) || 1

  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0
    return state / 4_294_967_296
  }
}

function pickIndex(random: () => number, length: number): number {
  return Math.min(length - 1, Math.floor(random() * length))
}

function generateRandomWords(random: () => number): string {
  return Array.from({ length: 12 }, () => {
    return TYPE_RUSH_WORDS[pickIndex(random, TYPE_RUSH_WORDS.length)]
  }).join(" ")
}

function generateNumbers(random: () => number): string {
  return Array.from({ length: 14 }, () =>
    String(Math.floor(random() * 100_000))
  ).join(" ")
}

function formatNumberWithCommas(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function generateNumbersWithPunctuation(random: () => number): string {
  return Array.from({ length: 10 }, () => {
    const whole = Math.floor(random() * 900_000) + 1_000
    const decimal = Math.floor(random() * 100)
    return `${formatNumberWithCommas(whole)}.${String(decimal).padStart(2, "0")}`
  }).join(" ")
}

function generateTypedContent(
  contentType: TypeRushContentType,
  random: () => number
): string {
  switch (contentType) {
    case "words":
      return generateRandomWords(random)
    case "numbers":
      return generateNumbers(random)
    case "numbers-punctuation":
      return generateNumbersWithPunctuation(random)
    default:
      return TYPE_RUSH_PROMPTS[pickIndex(random, TYPE_RUSH_PROMPTS.length)].text
  }
}

function pickParagraphPrompt(
  mode: TypeRushRoundMode,
  date: Date,
  random: () => number
): TypeRushPrompt {
  const promptRandom =
    mode === "daily"
      ? createSeededRandom(getDailySeed(date))
      : random
  const pack =
    TYPE_RUSH_PARAGRAPH_PACKS[
      pickIndex(promptRandom, TYPE_RUSH_PARAGRAPH_PACKS.length)
    ]
  const sentenceCount = 3 + pickIndex(promptRandom, 3)
  const maxStart = pack.sentences.length - sentenceCount
  const start = pickIndex(promptRandom, maxStart + 1)

  return {
    id: `paragraph:${pack.id}:${start}:${sentenceCount}`,
    text: pack.sentences.slice(start, start + sentenceCount).join(" "),
  }
}

export function getTypeRushPromptById(
  promptId: string
): TypeRushPrompt | undefined {
  return TYPE_RUSH_PROMPTS.find((prompt) => prompt.id === promptId)
}

export function pickTypeRushPrompt(
  mode: TypeRushRoundMode,
  date = new Date(),
  random = Math.random,
  contentType: TypeRushContentType = TYPE_RUSH_CONTENT_TYPE_DEFAULT
): TypeRushPrompt {
  if (contentType === "paragraph") {
    return pickParagraphPrompt(mode, date, random)
  }

  const promptRandom =
    mode === "daily"
      ? createSeededRandom(
          getDailySeed(date) + CONTENT_TYPE_SEED_OFFSETS[contentType]
        )
      : random

  return {
    id: `${contentType}-${mode === "daily" ? getDailySeed(date) : "practice"}`,
    text: generateTypedContent(contentType, promptRandom),
  }
}

export function isTypeRushPromptText(
  contentType: TypeRushContentType,
  promptId: string,
  text: string
): boolean {
  if (contentType === "paragraph") {
    const generatedId = /^paragraph:(.+):(\d+):(\d+)$/.exec(promptId)
    if (generatedId) {
      const [, packId, startValue, countValue] = generatedId
      const pack = TYPE_RUSH_PARAGRAPH_PACKS.find(
        (candidate) => candidate.id === packId
      )
      const start = Number(startValue)
      const count = Number(countValue)
      return (
        pack !== undefined &&
        Number.isInteger(start) &&
        Number.isInteger(count) &&
        count >= 3 &&
        count <= 5 &&
        pack.sentences.slice(start, start + count).join(" ") === text
      )
    }

    const prompt = getTypeRushPromptById(promptId)
    return prompt?.text === text
  }

  if (!promptId.startsWith(`${contentType}-`) || text.length === 0) {
    return false
  }

  switch (contentType) {
    case "words":
      return /^[a-z]+(?: [a-z]+)*$/i.test(text)
    case "numbers":
      return /^\d+(?: \d+)*$/.test(text)
    case "numbers-punctuation":
      return /^\d{1,3}(?:,\d{3})+\.\d{2}(?: \d{1,3}(?:,\d{3})+\.\d{2})*$/.test(
        text
      )
    default:
      return false
  }
}
