import { getDailySeed, hashSeed } from "../../daily"

import type { TypeRushRoundMode } from "./settings"

export type TypeRushPrompt = {
  id: string
  text: string
}

export const TYPE_RUSH_PROMPTS: readonly TypeRushPrompt[] = [
  {
    id: "steady-start",
    text: "A steady start makes a fast finish feel easy.",
  },
  {
    id: "small-steps",
    text: "Small steps build the rhythm that carries a long run.",
  },
  {
    id: "clear-focus",
    text: "Clear focus turns each careful keystroke into forward motion.",
  },
  {
    id: "quiet-practice",
    text: "Quiet practice makes speed feel natural when the moment arrives.",
  },
  {
    id: "keep-moving",
    text: "Keep moving through mistakes and let the next word reset your pace.",
  },
] as const

export function getTypeRushPromptById(
  promptId: string
): TypeRushPrompt | undefined {
  return TYPE_RUSH_PROMPTS.find((prompt) => prompt.id === promptId)
}

export function pickTypeRushPrompt(
  mode: TypeRushRoundMode,
  date = new Date(),
  random = Math.random
): TypeRushPrompt {
  const index =
    mode === "daily"
      ? hashSeed(getDailySeed(date)) % TYPE_RUSH_PROMPTS.length
      : Math.floor(random() * TYPE_RUSH_PROMPTS.length)

  return TYPE_RUSH_PROMPTS[index] ?? TYPE_RUSH_PROMPTS[0]
}
