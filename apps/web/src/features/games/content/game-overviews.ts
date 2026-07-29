/**
 * SSR-visible copy for available game landing pages.
 * Kept outside dialogs so crawlers (and AdSense reviewers) see real publisher content.
 */

export type GameOverviewSection = {
  title: string
  paragraphs: readonly string[]
}

export type GameOverview = {
  intro: readonly string[]
  sections: readonly GameOverviewSection[]
}

export const GAME_OVERVIEWS: Readonly<Record<string, GameOverview>> = {
  crossword: {
    intro: [
      "Pasttime Crossword is a free browser crossword you can open without an account or download. Each puzzle is a classic interlocking grid: white squares hold letters, black squares separate answers, and every clue points to one across or down entry.",
      "Play the shared daily puzzle for a common challenge, or switch to a fresh random grid when you want another round. Progress stays on your device, so you can pause and resume on the same browser.",
    ],
    sections: [
      {
        title: "How to play",
        paragraphs: [
          "Select any white square to start typing. Letters fill the active word; Backspace clears a cell. Toggle between across and down to follow the clue you are solving. Crossing letters help confirm answers as the grid fills in.",
          "Use the clue list to jump between entries, and check your work when you want feedback. The goal is a fully filled grid where every answer matches its clue.",
        ],
      },
      {
        title: "Why play here",
        paragraphs: [
          "No signup wall, no install — just a calm crossword layout with daily and endless modes. Stats and streaks stay local so you can track progress privately while still sharing a spoiler-free result when you finish.",
        ],
      },
    ],
  },
  "word-guess": {
    intro: [
      "Word Guess is Pasttime’s free word puzzle: find the hidden word in a limited number of tries. After each guess, tile colors show which letters are correct, present but misplaced, or absent — so every attempt teaches you something new.",
      "Choose a word length that fits your mood, play the daily word for a shared challenge, or keep going in endless mode. Hard mode is available when you want stricter follow-through on revealed letters.",
    ],
    sections: [
      {
        title: "How to play",
        paragraphs: [
          "Type a valid word of the chosen length and submit. Green means the letter is in the right spot, amber means it belongs somewhere else in the word, and muted tiles mean that letter is not used. Keyboard colors update as you learn.",
          "Win by discovering the word before you run out of rows. You can also create or join a room to play with friends when multiplayer is enabled.",
        ],
      },
      {
        title: "Why play here",
        paragraphs: [
          "Fast rounds, clear feedback, and local stats without forcing an account. Word Guess is built for a quick mental break or a longer streak — in the browser, on your schedule.",
        ],
      },
    ],
  },
  solitaire: {
    intro: [
      "Pasttime Solitaire brings classic patience card games to the browser. Start with Klondike and explore additional layouts as they are offered — all playable instantly, with no download and no account required.",
      "Build foundations by suit, clear the tableau with careful sequencing, and use the stock when you need another card. Games save locally so you can step away and return later on the same device.",
    ],
    sections: [
      {
        title: "How to play",
        paragraphs: [
          "Move cards between tableau columns following the mode’s rules (for Klondike: descending ranks in alternating colors). Empty columns and foundation piles open new paths as you uncover face-down cards.",
          "Draw from the stock when the tableau is blocked, and send completed suit sequences to the foundations. Clear the deal to win; start a new layout whenever you want another run.",
        ],
      },
      {
        title: "Why play here",
        paragraphs: [
          "A clean, distraction-light solitaire table with settings for how you like to play. It is free, private by default, and ready whenever you need a short reset.",
        ],
      },
    ],
  },
  sudoku: {
    intro: [
      "Pasttime Sudoku is a free classic number puzzle in the browser. Fill a 9×9 grid so every row, column, and 3×3 box contains the digits 1–9 exactly once — using logic, not guesswork.",
      "Pick a difficulty that matches your pace, play the daily board for a shared challenge, or generate a fresh puzzle anytime. Your progress stays on your device.",
    ],
    sections: [
      {
        title: "How to play",
        paragraphs: [
          "Select an empty cell and enter a digit. Conflict highlighting helps you spot duplicates in a row, column, or box. Use notes (pencil marks) to track candidates while you narrow possibilities.",
          "Clear every empty cell with a valid digit to finish. Daily mode gives one shared puzzle per difficulty; endless mode deals a new board whenever you want another solve.",
        ],
      },
      {
        title: "Why play here",
        paragraphs: [
          "No account gate and a focused board layout meant for uninterrupted thinking. Sudoku on Pasttime is built for quiet concentration — open it, solve, and move on with your day.",
        ],
      },
    ],
  },
}

export function getGameOverview(gameId: string): GameOverview | undefined {
  return GAME_OVERVIEWS[gameId]
}
