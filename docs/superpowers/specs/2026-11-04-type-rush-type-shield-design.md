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
- Type Shield will later use a continuous word stream and diverge into waves,
  targets, health, scoring, and co-op behavior.
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

## Type Shield boundary

Type Shield will consume shared character and metric behavior later, but its
domain will own target queues, target completion, spawning, waves, missed
targets, health/lives, scoring, and co-op ownership.

## Testing

- Shared typing behavior receives pure unit tests.
- Type Rush domain receives tests for deterministic prompts, forgiving input,
  completion, metrics, daily/practice state, and persistence validation.
- Type Rush web tests cover launch routing, play progress, resume behavior, and
  completion rendering.
- Workspace quality gates remain `lint`, `typecheck`, `test`, and `build`.
