# Type Rush and Type Shield Design

**Date:** 2026-11-04

## Goal

Add Type Rush as the first new solo typing game while establishing a small
framework-free typing core that Type Shield can reuse later.

## Product decisions

- Type Rush starts as a solo timed trial.
- Type Rush uses a fixed curated passage, not generated dictionary words.
- Type Rush supports a shared daily passage and a practice mode.
- Type Rush accepts mistyped characters, records them as errors, and advances.
- Type Shield's solo round is a dome defense game. Co-op can share that stage later.
- Multiplayer rooms, rankings, share cards, and achievements are deferred.

## Architecture

The shared core lives at `packages/domain/games/shared/typing/` and contains
pure input, progress, and metric functions. It does not own a game round,
prompt selection, persistence, React state, or DOM events.

Type Rush lives at `packages/domain/games/type-rush/`. Its domain state owns
the selected passage, mode, progress, elapsed time, error counts, terminal
status, and persistence representation. Curated prompts are bundled as a
small data set and selected deterministically for daily play.

The web feature lives at
`apps/web/src/features/games/type-rush/` and follows the existing game plugin
pattern: launch view, play view, settings, How to Play content, hook, and
validated localStorage persistence. Type Rush is registered as solo-only until
room support is intentionally added.

## Shared typing contract

The core must support:

- normalized passage text with line breaks converted to spaces;
- case-insensitive letter comparison while preserving spaces and punctuation;
- forgiving character submission;
- progress and error counts;
- accuracy and WPM calculation from elapsed milliseconds;
- pure command/input operations that do not depend on `KeyboardEvent`.

Type Shield may reuse these primitives, but it will not reuse Type Rush's
passage round state.

## Type Rush behavior

- The daily mode selects a passage from the curated prompt pack using the
  existing daily seed helper.
- Practice mode selects another passage without daily completion semantics.
- A round begins when the first character is entered.
- Each entered character advances the passage cursor.
- Correct characters increment the correct count.
- Incorrect characters increment the error count and remain visible as errors.
- Completion occurs after the final passage character is processed.
- The result stores elapsed milliseconds, accuracy, WPM, and character counts.
- An active round resumes from validated localStorage after refresh.
- Daily wins record through the existing engagement layer.
- Settings includes Allow Backspace. It is on by default and stored on this
  device at `pasttime.type-rush.backspace`. Turning it off ignores Backspace
  and says so under the passage.
- Every game tagged `typing` shows a handheld notice from the shared launch
  and play shells. Every player sees it. Continue closes it. Don't Show Again
  is stored separately for each game at `pasttime.typing.handheld-notice.<id>`.
  The dialog keeps the line near 60 characters.

## Type Shield solo round

Type Shield consumes the shared strict typing input for each comet word. Its
domain owns the comet queue, spawn timing, misses, lives, score, difficulty,
and mode. Co-op stays out of this round.

- The stage is a dome at the bottom center of a wide night field. A low ridge,
  moon, dish, and a few stones sit behind the play. Stars, haze, dust, and
  rare thin streaks move slowly. That motion stops when the system asks for
  reduced motion. Comet Effects covers comet arrival, destruction, and the
  dome shake.
- A round waits 3 seconds, shown as Get Ready and then 3, 2, 1. Typing does
  nothing during the count. New Game, and a change of difficulty or mode,
  start the count again.
- The shield has 5 lives. A comet that reaches the dome costs one life. Score
  is 10 points per letter.
- Settings offers Survival and Endless, then Easy, Medium, Hard, and
  Nightmare. Survival is the default. It lasts 2 minutes, the clock starts
  after the countdown, and the round is won if any lives remain. Endless ends
  only when the shield falls. A killing hit at the Survival deadline is still
  a loss.
- Words come from the dictionary at lengths 5–10 and are shown in lowercase.
  Lengths 3–4 stay out. Easy uses 5–6 letters and makes the longer length
  rarer. Medium uses 5–8 the same way. Hard uses every length from 5 up, with
  equal weight per length. Nightmare uses those lengths and favors the longer
  ones. A length is chosen first, then a word of that length that is not
  already falling.
- Pace is words per minute. Easy holds 25 (band 15–35), Medium holds 46
  (36–55), and Hard holds 66 (56–75). Nightmare starts at 76 and climbs every
  6.5 seconds to 150. Fall time follows the letters in that spawn, so one
  comet uses its own length and a group shares the combined length. The group
  falls slower, and the next spawn waits for the whole group. At most three
  comets are on screen.
- Easy releases one comet. From Medium up, a spawn can release a group.
  Medium rarely sends two. Hard rarely sends two or three. Nightmare uses the
  same cap of three more often.
- Letters that still fit more than one comet light up on each of them. Typing
  met marks those letters on both meteor and metric. The comet locks when the
  next letter fits only that word. Backspace drops the last letter and lights
  up every comet the shorter prefix still fits. A letter that fits none of
  them is ignored.
- Stats uses the shared stats page at `/games/type-shield/stats`. One result
  is stored per UTC day, with the difficulty as the variant. A Survival win
  counts as a solve. An Endless ending is a loss.

## Type Shield template fit

Launch uses `GamePageShell`, `GameSessionHeader`, the settings widget, and
`GameLaunchActions`. Play uses `GamePlayShell` and `GamePlaySection`: header,
settings, stage, and a footer with New Game and Back To Setup. Labels stay
Play, How To Play, New Game, Back To Setup, and Back To Catalog.

Exceptions, from the game itself:

- Solo only until co-op exists, so Create Room and Join Room are omitted.
- No daily puzzle, so there is no Play Daily Puzzle or View Today's Results.
  The primary action is Play. Stats still uses the shared stats page. A round
  records one result for the UTC day when it ends, with the difficulty as the
  variant. Endless has no win. Survival is won by lasting 2 minutes.
- The stage is wider than the default `max-w-lg` column so comets at the
  sides stay on screen. The header, settings, and footer stay in the template.
- When the dome falls, New Game is repeated on the stage overlay because the
  stage covers the footer. It is the same action and the same label.

## Testing

- Shared typing behavior receives pure unit tests.
- Type Rush domain receives tests for deterministic prompts, forgiving input,
  completion, metrics, daily/practice state, and persistence validation.
- Type Rush web tests cover launch routing, play progress, resume behavior,
  completion rendering, and Backspace turned off.
- The handheld notice tests cover dismissal for one typing game without hiding
  another.
- Workspace quality gates remain `lint`, `typecheck`, `test`, and `build`.
