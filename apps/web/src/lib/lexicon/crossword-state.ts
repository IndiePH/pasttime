import {
  buildCrosswordPool,
  createCrosswordGameState,
  hydrateCrosswordClues,
  type CrosswordGameState,
  type CrosswordGridSize,
  type CrosswordRoundMode,
} from "@pasttime/domain/games/crossword"
import { loadCrosswordAnswers, loadWordDefinitions } from "@/lib/lexicon/client"

export async function createHydratedCrosswordGameState(
  size: CrosswordGridSize,
  mode: CrosswordRoundMode,
): Promise<CrosswordGameState> {
  const answers = await loadCrosswordAnswers()
  const pool = buildCrosswordPool(answers)
  const base = createCrosswordGameState({ pool, size, mode })
  const placedWords = [
    ...new Set([
      ...base.puzzle.across.map((clue) => clue.answer),
      ...base.puzzle.down.map((clue) => clue.answer),
    ]),
  ]
  const cluesByAnswer = await loadWordDefinitions(placedWords)
  return {
    ...base,
    puzzle: hydrateCrosswordClues(base.puzzle, cluesByAnswer),
  }
}
