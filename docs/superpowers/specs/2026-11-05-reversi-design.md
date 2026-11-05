# Reversi Design

**Date:** 2026-11-05
**Status:** Implemented 2026-11-05
**Scope:** A finishable 8×8 Reversi match. The person plays Black. A local computer plays White.

## Goal

Ship Reversi as a playable solo game. The person places Black. A computer on this device places White at Easy, Medium, or Hard. The board rules stay separate from who occupies each seat.

## Product decisions

- Standard 8×8 Reversi. Black starts.
- A placement must flip at least one opposing disc. Legal squares are marked. Any other click leaves the board unchanged.
- A side with no legal square passes. The match ends when neither side can move. The higher disc count wins. Equal counts draw.
- The person is Black. The computer is White. Settings stores Easy, Medium, or Hard on this device. The default is Medium.
- Animate Flips starts on. Settings can turn it off. The choice stays on this device.
- The hub lists Reversi as available and "1 player". There is no room, in-progress saved match, share card, or daily mode. Completed match history and local stats are stored on the device.
- Launch and play use the shared game template. The primary label stays Play. Create Room and Join Room are omitted.

## Starting position

Files `a`–`h` run left to right. Ranks `1`–`8` run bottom to top, so rank 8 is the top row on screen. Store the board with row `0` as rank 8.

| Square | Disc |
| --- | --- |
| d5 | White |
| e5 | Black |
| d4 | Black |
| e4 | White |

In row/column indexes that is `(3,3)` White, `(3,4)` Black, `(4,3)` Black, `(4,4)` White. Every other square is empty. The center looks like this on screen:

```text
W B
B W
```

## Rules

- Eight directions: orthogonal and diagonal.
- From the placed square, a line flips when one or more opposing discs are followed by a disc of the side to move. Empty squares and the board edge stop a line. Every such line flips.
- `legalMoves` returns the empty squares that would flip at least one disc.
- `applyMove` uses the color already stored as the turn. It returns `null` when the match has ended or the square is not legal, and the caller keeps the previous position. On success it places that color, flips every captured line, then gives the turn to the other color.
- After that switch, if the side to move has no legal square and the other side has one, the turn passes once and `lastPass` records the side that passed. If neither side has a legal square, the match ends. A full board ends the same way.
- `lastPass` clears when a disc is placed.
- Scores are counted from the board. They are not stored separately.
- `winner` is `"black"`, `"white"`, `"draw"`, or `null` while the match is still going.

## Seat boundary

The position does not know who is playing. A session adds a seat for each color.

```ts
type Side = "black" | "white"
type Disc = Side | null
type Square = { row: number; col: number }
type Difficulty = "easy" | "medium" | "hard"

type Position = {
  board: Disc[][]
  turn: Side
  status: "playing" | "ended"
  winner: Side | "draw" | null
  lastPass: Side | null
}

type Seat =
  | { kind: "human" }
  | { kind: "computer"; difficulty: Difficulty }

type Session = {
  position: Position
  seats: Record<Side, Seat>
}

type MoveChooser = (position: Position, difficulty: Difficulty) => Square

type NextStep =
  | { type: "human" }
  | { type: "computer"; side: Side; difficulty: Difficulty }
  | { type: "ended" }
```

- `createSession(seats)` builds a new position with those seats.
- `createHotseatSession()` is `createSession` with both seats `{ kind: "human" }`. The tests use it. The play screen uses `createComputerSession`.
- `acceptHumanMove(session, square)` places a disc only when the match is playing, the seat for the color to move is human, and the square is legal. Otherwise it returns `null` and the session stays unchanged.
- `applyComputerMove(session, square)` places a disc only when that seat is `computer` and the square is legal.
- `nextStep(session)` returns `ended`, `human`, or `computer` with that seat's difficulty.
- `chooseMove(position, difficulty)` is the local computer. Easy searches one ply and counts discs. Medium searches three plies with positional weights. Hard searches five plies, and the remaining empty squares when six or fewer are left. It runs in the page. No request leaves the device.
- `createComputerSession(difficulty)` seats a person as Black and the computer as White. Settings store Easy, Medium, or Hard on this device and update that seat. The default is Medium.
- Settings also store whether captured discs animate. That choice defaults to on, under `pasttime.reversi.flipAnimation`. The page plays the new disc, then turns each captured disc over from nearest to farthest. The computer waits until that sequence finishes. Turning it off updates the board at once. `flippedSquares` lists the discs a legal move captures.

The play screen creates a computer session. A person plays Black. After a human move, the page follows `nextStep` and, when the step is `computer`, calls `chooseMove` and `applyComputerMove`. The board still only reports a clicked square.

## Template fit

Launch uses `GamePageShell`: `GameSessionHeader`, the settings widget under the header, then `GameLaunchActions` (How To Play, Play, Stats, Back To Catalog) and the overview.

Play uses `GamePlayShell` with `layout="board"` and `GamePlaySection`: header, registered settings, the score, the turn line, and the board, then New Game and Back To Setup.

Exceptions: there is no daily mode, so the primary label stays Play. The game is solo only, so Create Room and Join Room are omitted.

## Architecture

| Layer | Path | Responsibility |
| --- | --- | --- |
| Domain | `packages/domain/games/reversi/` | Position, legal moves, placement, pass, score, session, seats. No React. |
| Feature | `apps/web/src/features/games/reversi/` | Launch view, play view, stats view, computer hook, match history, difficulty and flip settings, How To Play |
| Catalog | `packages/domain/games/registry.ts` | `status: "available"`, tags `board` and `strategy`, `playerCount: "1 player"` |
| Wiring | Module, How To Play, and overview registries | One Play action and the rules dialog |

Import the domain from `@pasttime/domain/games/reversi`. Leave it out of the root domain barrel. Remove `minPlayers`, `maxPlayers`, and the `multiplayer` tag so the shared launch actions do not offer Create Room or Join Room.

The launch view offers one `Play` button to `/games/reversi/play`, plus How To Play and the existing overview. The play view uses `GamePlaySection` on the board layout. It shows both scores, the color to move, a pass sentence when `lastPass` is set, and a result line when the match has ended. A shared post-solve dialog opens when the match ends with the result, final score, New Game, View Stats, and Close actions. `New Game` replaces the session with `createComputerSession`. There is no keyboard control.

The hook stores one `Session`. Each square is a button. A click calls `acceptHumanMove`. A `null` result does not change state. When `nextStep` is `computer`, the hook calls `chooseMove` and `applyComputerMove` after the flip animation, or at once when animation is off. When a match ends, the hook records the final Black and White counts and result in local match history.

The stats page follows the shared stats-page shell and cards. It shows a boxing-style `Wins–Losses–Draws` record with a `W Wins · L Losses · D Draws` legend, total games, win rate, longest win streak, biggest win margin, and average score margin across all completed matches.

## Copy

- Play button: `Play`. Result actions: `New Game`. Dialog title follows the existing How To Play control.
- Turn line: `Black to play` while the person moves. `Black is flipping` or `White is flipping` while discs turn over. `White is thinking` while the computer chooses.
- Pass line: `White has no move. Black to play.` The names follow the side that passed and the side now to move.
- Result line: `Black wins 38–26`, `White wins 26–38`, or `Draw 32–32`, using the live counts. The first number is Black.
- Result dialog: `Black wins!`, `White wins!`, or `Draw game`, with `Final score 38–26` and New Game, View Stats, and Close actions.
- Landing overview: you play Black and the computer plays White. Difficulty is Easy, Medium, or Hard.
- `docs/GAMES.md`: Reversi is playable against a local computer.

## Testing

Domain tests cover the starting position, a one-line flip, a multi-direction flip, a rejected illegal square, an automatic pass, a second pass that ends the match, a full board, a win, and a draw. Session tests cover hotseat placement for both colors, `acceptHumanMove` returning `null` when the side to move is a computer seat, and `applyComputerMove` placing a legal square for a computer seat while rejecting a human seat. `nextStep` is human for the hotseat session, computer when that seat is computer, and ended when the match is over.

Web tests cover a legal click that shows `Black is flipping` and then the computer answering so Black is to play again, an illegal click that leaves the board unchanged, flip animation starting on, New Game restoring the starting position, the terminal result dialog, match-history persistence, and the boxing-style stats view.

`lint`, `typecheck`, `test`, and `build` stay the quality gates.

## Out of scope

- In-progress saved games, share cards, daily puzzles, and rooms.
- Choosing to play White, board-size variants, and move undo.
