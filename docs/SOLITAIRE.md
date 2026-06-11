# Solitaire

## Launch settings (implemented)

Modes in `SOLITAIRE_MODES` (`src/domain/games/solitaire/modes.ts`), synced via `?mode=` on launch and play:

| Mode | Why included |
|------|----------------|
| **Klondike** | Default; what most people mean by “Solitaire”. |
| **Pyramid** | Distinct rules, single deck, no foundations — moderate UI cost. |
| **TriPeaks** | Casual, popular, simple ±1 rank rule. |
| **FreeCell** | Iconic, all face-up — different layout but still one deck. |

Future Klondike-only toggles (not separate modes): draw 1 vs draw 3, scoring.

## Deferred (not in settings yet)

| Variant | Reason to defer |
|---------|------------------|
| **Spider** | Often two decks / ten columns — heavier deal and UI. |
| **Yukon** | Very close to Klondike; low differentiation. |
| **Forty Thieves** | Hard, slower, niche audience. |
| **Golf / Clock / Canfield** | Lower demand or odd layouts for v1. |

Add a mode by extending `SOLITAIRE_MODES`, `SOLITAIRE_MODE_INFO`, and implementing its play engine.
