/**
 * SSR-visible copy for game landing pages.
 * Kept outside dialogs so crawlers (and AdSense reviewers) see real publisher content.
 * Available games: mechanics live in How to play. Coming soon: history only until launch.
 */

export type GameOverviewSection = {
  title: string
  paragraphs: readonly string[]
}

export type GameOverview = {
  intro: readonly string[]
  sections: readonly GameOverviewSection[]
}

const COMING_SOON_NOTE =
  "This title is marked Coming soon on Pasttime. You can still read the background below. Play controls will appear here when the game ships."

export const GAME_OVERVIEWS: Readonly<Record<string, GameOverview>> = {
  crossword: {
    intro: [
      "Pasttime Crossword is a free American-style grid in the browser: interlocking across and down answers, a shared daily puzzle, and random boards when you want another round. Open How to play above for the controls. The notes below are about where the form came from.",
      "No account or download is required. Progress stays on this device so you can pause a half-finished grid and return later.",
    ],
    sections: [
      {
        title: "Where crossword came from",
        paragraphs: [
          "The modern newspaper crossword is usually dated to 21 December 1913, when Arthur Wynne published a diamond-shaped “Word-Cross Puzzle” in the New York World. The diamond became a square, the hyphen dropped out, and the black-and-white grid settled into a daily habit in English-language papers.",
          "American-style puzzles (the kind Pasttime uses) grew into a fully checked grid: every letter sits in both an across and a down word, so crossings do most of the proving. The New York Times added a Sunday puzzle in 1942 and a daily in 1950. By then crossword had become a ritual as much as a pastime. Cryptic crosswords, more common in Britain, work by a different clue grammar and are a sibling tradition, not the same game.",
          "What traveled well to the web is the same compact challenge: a finite grid, a clue list, and the satisfaction of a last stubborn entry snapping into place. Digital versions keep that newspaper-table feel without needing print or a pen.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "We keep a calm board, daily and endless modes, and local stats, with no signup wall. Share a spoiler-light result when you finish if you want. The puzzle history itself stays on your browser.",
        ],
      },
    ],
  },
  "word-guess": {
    intro: [
      "Word Guess is Pasttime’s free color-feedback word puzzle: find a hidden word in a limited number of tries. Length, daily or endless play, and optional hard mode are in the launch controls. How to play above covers tiles and keyboard colors.",
      "Rounds are meant to be short. Stats stay on this device unless you clear site data.",
    ],
    sections: [
      {
        title: "Where word-guess puzzles came from",
        paragraphs: [
          "Guessing a secret word from limited tries is older than any one app. Lingo on television, Mastermind-style pegs, and hangman all trained the same loop: propose a word, read the feedback, narrow the field. What changed in the early 2020s was the daily, shareable grid. Typical form: a five-letter word, six rows, and a private-looking result you could post without spoiling the answer.",
          "Josh Wardle’s Wordle (2021), later acquired by the New York Times, made that pattern a global water-cooler. Copies and cousins followed: different lengths, hard-mode constraints, and local or endless variants. Pasttime’s Word Guess sits in that family without pretending to be the original. You get the same readable color language, plus extra room for length and mode so a break can be one word or a streak.",
          "The appeal is still small and social-optional: one board, clear signals, and a result you can keep to yourself or share as a pattern of squares.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "Play solo on a daily word or keep going in endless mode. You can also open a room when you want friends on the same rules. No account is required either way.",
        ],
      },
    ],
  },
  solitaire: {
    intro: [
      "Pasttime Solitaire is a free browser table for patience card games, starting with Klondike and other layouts as they are offered. How to play above has the move rules for the mode you picked. This page is the short history of why this particular deal became “solitaire” for so many people.",
      "Games save locally. Step away and the tableau is still here on the same browser.",
    ],
    sections: [
      {
        title: "Where Klondike solitaire came from",
        paragraphs: [
          "Patience means laying out a shuffled deck and trying to sort it by strict rules. It was already a European parlor habit in the eighteenth and nineteenth centuries. Printed rule books spread dozens of layouts. The version English speakers most often just call “solitaire” is Klondike: seven tableau columns, a stock, and four foundations that run ace to king by suit.",
          "The name points at the Klondike gold rush of the late 1890s. Whether miners actually played this deal in the Yukon is less documented than the branding that stuck in North America. What is clear is that Klondike became the default once personal computers shipped a copy with the operating system. Microsoft Solitaire (1990) taught a generation mouse-drag and double-click by turning idle minutes into a winnable layout.",
          "Draw-1 versus draw-3, Vegas scoring, and timed runs are later house rules on the same skeleton. Digital tables kept the cards and dropped the dining-room space, which is why a browser version still feels like the original game rather than a new genre.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "A quiet table, settings that stay out of the way, and no account gate. Use it for a short reset or a longer deal. Either way, the history on this page is the same nineteenth-century patience idea, not a different game.",
        ],
      },
    ],
  },
  sudoku: {
    intro: [
      "Pasttime Sudoku is a free 9×9 logic grid in the browser: every row, column, and 3×3 box holds the digits 1–9 once. Difficulty, daily boards, and notes are in the launch controls. How to play above is the short rule card.",
      "Progress stays on this device. Open a puzzle, think, and leave it until you come back.",
    ],
    sections: [
      {
        title: "Where Sudoku came from",
        paragraphs: [
          "The core rule is older than the name: place symbols so none repeat in a row or column. Latin squares appear in Euler’s mathematics. Newspaper number grids showed up much later. In 1979, Dell Pencil Puzzles and Word Games published “Number Place,” designed by Howard Garns. The 9×9 grid with 3×3 boxes is already there.",
          "In 1984 the Japanese publisher Nikoli printed the same idea as Sūji wa dokushin ni kagiru (“the digits must remain single”), soon shortened to Sudoku. Nikoli’s house style favored puzzles solvable by logic, not brute guessing, and a hand-crafted look rather than a raw computer dump. The worldwide boom arrived in 2004–2005, when Wayne Gould’s generator and The Times of London put a daily Sudoku next to the crossword for commuters who had never heard of Number Place.",
          "After that, Sudoku stopped being a novelty and became a standard. Paper, apps, and browser boards all teach the same three houses (row, column, box). Difficulty bands and pencil marks are the usual digital extras. The underlying puzzle is still Garns’s grid with Nikoli’s name.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "A focused board, daily or fresh puzzles, and no signup. Meant for quiet concentration: open it, solve, and get back to the rest of the day.",
        ],
      },
    ],
  },
  tongits: {
    intro: [
      "Tongits is a three-player rummy-style card game popular in the Philippines. Pasttime plans a browser table with draw and discard turns for quick rounds with friends.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where Tongits came from",
        paragraphs: [
          "Tongits grew as a Filipino house and street game in the late twentieth century, often played with a standard 52-card deck among three people. Like other rummy relatives, the loop is draw, meld, and discard, with fights over who can go out or force opponents to fold under pressure.",
          "Regional house rules vary (when a fight can be called, how burned cards work, what counts as a winning dump), which is part of why the game feels local even when the deck looks familiar. It spread through family gatherings, computer cafés, and later phone apps that kept the same three-handed rhythm.",
          "What people remember is less a single published rulebook and more a shared table culture: talkative rounds, quick melds, and the tension of deciding whether to challenge or stay in.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "When Tongits ships, expect a calm multiplayer table aimed at 2–3 players, with the same no-account default as the rest of the hub. Until then, this page is background only.",
        ],
      },
    ],
  },
  "pusoy-dos": {
    intro: [
      "Pusoy Dos (also called Filipino Poker or Dos) is a shedding game: race to empty your hand with singles, pairs, and larger combinations. Pasttime plans a browser room for 2–4 players.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where Pusoy Dos came from",
        paragraphs: [
          "Pusoy Dos belongs to the big family of climbing and shedding games that traveled through East and Southeast Asia: play a combination that beats the previous one, or pass. Related cousins include Big Two (Choi Dai Di) in Chinese communities and other “dos” variants where the deuce often ranks high.",
          "In the Philippines the game settled into a lively social staple, frequently four-handed, with strict combination ranks and the race to go out first. House rules differ on wild patterns and on how the last cards of a hand must be played, so every circle tends to teach newcomers its own table law.",
          "Digital tables kept the same pressure: watch the lead, decide whether to dump high cards early, and time a combination that clears the rest of your hand.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "The planned Pasttime version is a free browser room for sequence and combo play, without a signup wall. Playable controls are not live yet.",
        ],
      },
    ],
  },
  reversi: {
    intro: [
      "Reversi (widely known through the Othello brand) is a two-player disc-flipping board game: surround enemy pieces to capture territory until the board fills. Pasttime plans a clean browser board for 1–2 players.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where Reversi came from",
        paragraphs: [
          "Reversi was patented in London in the 1880s by Lewis Waterman and, separately, John W. Mollett, as a game of black and white discs on an 8×8 board. The core idea is simple to teach: place a disc so it brackets one or more opposing discs in a straight line, then flip them to your color.",
          "In 1971 Goro Hasegawa introduced Othello in Japan with a fixed starting position and refined presentation. The branded set popularized the game worldwide, while “Reversi” remained the generic name in many rulebooks and computer ports.",
          "Early computer versions (including bundled PC games) made the perfect-information duel familiar to people who never owned a wooden set. Strategy still rewards edge control, tempo, and counting flips rather than chasing every capture.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "When Reversi arrives, expect solo practice against a quiet opponent mode and optional two-player play in the browser. Until launch, only this history is available here.",
        ],
      },
    ],
  },
  "fleet-grid": {
    intro: [
      "Fleet Grid is Pasttime’s planned take on classic fleet combat: hide ships on a grid, call coordinates, and sink every vessel before your opponent does.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where fleet grid games came from",
        paragraphs: [
          "Pencil-and-paper battles on numbered grids go back at least to the early twentieth century. Players marked ship positions in secret, then called out coordinates while the other answered hit or miss. Commercial board games later packaged the same idea with plastic pegs and printed seas.",
          "Milton Bradley’s Battleship (popularized widely from the 1960s onward) fixed the image most people know: two facing grids, a fleet of different lengths, and the ritual call of “B-4.” Computer and browser ports kept the fog of war and the slow reveal of a destroyed ship.",
          "Variants change fleet sizes, allow special shots, or play on larger maps, but the pleasure is the same: deduction from sparse feedback and the moment a final ship goes under.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "Fleet Grid is intended as a free 1–2 player browser duel with clear hit/miss feedback and no install. The playable board is not ready yet.",
        ],
      },
    ],
  },
  spades: {
    intro: [
      "Spades is a four-player trick-taking partnership game: bid how many tricks you will take, then win them with spades as the permanent trump suit. Pasttime plans a browser table for coordinated play.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where Spades came from",
        paragraphs: [
          "Spades emerged in the United States in the late 1930s, often credited to players looking for a partnership trump game that felt faster and more accessible than contract bridge. Spades are always trump, and the auction is a simple bid of trick counts rather than a full bridge bidding ladder.",
          "The game spread through college campuses, military bases, and family tables, then through computer clients that made four-handed play easy when a living room was short one partner. Scoring rewards making your bid exactly enough, with sandbagging penalties when overtricks pile up under many house rules.",
          "What sticks is the partnership talk without open card talk: reading your partner’s plays, counting trump, and deciding when to nil.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "A Pasttime Spades room would keep the classic bid-and-trick loop in the browser for 2–4 players. That table is still on the way.",
        ],
      },
    ],
  },
  "word-factory": {
    intro: [
      "Word Factory is planned as a timed word-building challenge: pull as many valid words as you can from a shared letter set, solo or against others in a room.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where word-factory puzzles came from",
        paragraphs: [
          "Making many words from a fixed pool of letters is an old parlor and classroom trick. Anagram cards, “how many words can you find,” and newspaper scramble boxes all train the same eye for prefixes, plurals, and buried stems.",
          "Board and app hits later gave the idea a timer and a scoring table. Boggle (1972) shook letters into a grid and scored unique words. Other titles used a random rack, a countdown, and multiplayer comparison so two people could share one letter set without sharing answers.",
          "Digital versions keep the rush of the clock and the quiet pride of spotting a long word everyone else missed.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "Word Factory is meant to join the hub as a free browser round for 1–4 players with local-friendly scoring. Gameplay is not live on this page yet.",
        ],
      },
    ],
  },
  "type-rush": {
    intro: [
      "Type Rush is planned as a speed-and-accuracy typing race: prompts appear, you type them cleanly, and the fastest clean run wins.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where typing races came from",
        paragraphs: [
          "Competitive typing is as old as typewriter classrooms and secretarial contests that measured words per minute. Computer labs turned the same skill into games: copy the line before the timer ends, or beat a friend’s score on a shared text.",
          "Browser and desktop racers in the 2000s (including multiplayer arenas where avatars advance as you type) made accuracy visible. A single typo could cost a win even if your raw speed looked high.",
          "The genre stays popular because the rules are obvious, rounds are short, and improvement is measurable without a long tutorial.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "Type Rush is intended for 1–6 players in the browser, with the same lightweight Pasttime shell as other titles. The race track is still under construction.",
        ],
      },
    ],
  },
  "type-shield": {
    intro: [
      "Type Shield is planned as a defensive typing game: words fall or advance toward your base, and you type them to destroy or deflect them before impact.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where typing defense games came from",
        paragraphs: [
          "Typing tutors once used falling letters to force focus. Arcade-inspired PC games flipped that into defense: destroy threats by typing their labels before they reach the bottom of the screen.",
          "Titles in the 1990s and 2000s (including well-known “type to shoot” games) mixed wave design with vocabulary. Later browser and mobile ports kept the same fantasy: you are a shield made of keyboard speed.",
          "Co-op variants let friends split the words on screen, which turns a solo drill into a noisy living-room sport.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "Type Shield is sketched as a 1–4 player browser defense mode with readable word targets and no install. It is not playable here yet.",
        ],
      },
    ],
  },
  "tile-words": {
    intro: [
      "Tile Words is planned as a letter-tile strategy game: place tiles on a board, form words, and outscore opponents with placement and multipliers.",
      COMING_SOON_NOTE,
    ],
    sections: [
      {
        title: "Where tile word games came from",
        paragraphs: [
          "Crossword-style scoring with physical letter tiles became a mainstream living-room game when Scrabble (Alfred Butts’s Lexiko/Criss-Cross Words design, commercialized in the mid-twentieth century) spread through English-speaking households. Players draw tiles, build on a shared grid, and chase premium squares.",
          "Cousins and descendants kept the rack-and-board fantasy while changing timing, dictionary strictness, or multiplayer pacing. Digital editions added timers, chat, and asynchronous turns so a match could last a day without clearing the kitchen table.",
          "The enduring pull is dual: crossword sense for words, and spatial sense for where a word hurts or helps the score.",
        ],
      },
      {
        title: "On Pasttime",
        paragraphs: [
          "Tile Words is aimed at 2–4 players in the browser with a clear board and no account wall. The tile bag is not open for play on Pasttime yet.",
        ],
      },
    ],
  },
}

export function getGameOverview(gameId: string): GameOverview | undefined {
  return GAME_OVERVIEWS[gameId]
}
