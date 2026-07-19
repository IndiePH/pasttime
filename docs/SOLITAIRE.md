# Solitaire

## Launch settings

Modes in `SOLITAIRE_MODES` (`packages/domain/games/solitaire/modes.ts`), synced via `?mode=` on launch and play:

| Mode | Status | Why included |
|------|--------|--------------|
| **Klondike Draw 1** | Playable | Default; one-card stock draws. |
| **Klondike Draw 3** | Playable | Standard harder Klondike variant with a fanned waste pile. |
| **Pyramid** | Preview only | Distinct rules, single deck, no foundations — moderate UI cost. |
| **TriPeaks** | Preview only | Casual, popular, simple ±1 rank rule. |
| **FreeCell** | Preview only | Iconic, all face-up — different layout but still one deck. |

Draw count is a launch mode, not an in-play toggle. Card skin and auto-stack
preferences persist separately from the active game.

## Klondike runtime

- The hook begins with no dealt state, so SSR and the first client render show
  the same loading board. Storage is read after mount; a valid save is resumed,
  otherwise a random deal is created.
- The stored state must include the selected `drawCount`; missing or mismatched
  saves are discarded.
- Storage/new-deal state is committed from `queueMicrotask` inside the effect,
  avoiding synchronous `setState` in the effect body.
- Draw 1 and Draw 3 share the same engine. Draw 3 supports partial final draws
  and shows up to three fanned waste cards.
- Drag, tap-to-select, double-tap auto-foundation, auto-stack, auto-complete,
  win detection, persistence, and a New Game action are implemented.

## Deferred (not in settings yet)

| Variant | Reason to defer |
|---------|------------------|
| **Spider** | Often two decks / ten columns — heavier deal and UI. |
| **Yukon** | Very close to Klondike; low differentiation. |
| **Forty Thieves** | Hard, slower, niche audience. |
| **Golf / Clock / Canfield** | Lower demand or odd layouts for v1. |

Add a mode by extending `SOLITAIRE_MODES`, `SOLITAIRE_MODE_INFO`, implementing
its domain engine and play surface, and replacing the current coming-soon card.
