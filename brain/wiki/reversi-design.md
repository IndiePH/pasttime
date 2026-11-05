# Reversi Design
updated: 2026-11-05
tags: [games, reversi, decision]
related: [engineering-decisions, classic-game-conventions]

You play Black. A local computer plays White. Launch and play use the shared game template. There is no daily mode, so the button is Play. The game is solo, so there are no rooms.

The spec is `docs/superpowers/specs/2026-11-05-reversi-design.md`.

## Stats

Completed matches are stored locally under a Reversi-specific history key,
because Reversi has no daily mode and can have multiple matches per day. The
stats page follows the shared Pasttime stats layout and shows a boxing-style
Wins–Losses–Draws record, total games, win rate, longest win streak, biggest
win margin, and average score margin.

## Match

Standard 8×8. Black starts. The center is White, Black, Black, White from the top-left of those four squares. A move must flip at least one disc. A side with no move passes. The higher count wins.

## Computer

`chooseMove(position, difficulty)` runs on the device. Easy looks one move ahead and takes discs. Medium looks three moves ahead with positional weights. Hard looks five, and plays out the board when six or fewer squares are empty. Settings store Easy, Medium, or Hard under `pasttime.reversi.difficulty`. The default is Medium. The page calls `applyComputerMove` only for the computer seat.

## Flips

Animate Flips is on by default and stored at `pasttime.reversi.flipAnimation`. The new disc lands, then each captured disc turns over from nearest to farthest. The computer waits until that finishes. Turning the setting off snaps the board to the new position.
