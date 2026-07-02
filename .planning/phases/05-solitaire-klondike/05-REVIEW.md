---
phase: "05-solitaire-klondike"
plan: "05-01 / 05-02"
depth: "deep"
review_date: "2026-07-02"
files_reviewed: 8
findings:
  critical: 0
  warning: 7
  info: 2
  total: 9
status: issues_found
fixes_applied:
  - "W-01: key={mode} added to KlondikePlaySection"
  - "W-02: flipTopTableauCard now creates new object instead of mutating"
  - "W-03: draw loop uses splice instead of pop with undefined guard"
  - "W-06: setFeedback lifted out of setState updater"
---

# Phase 5: Solitaire Klondike — Adversarial Code Review

## Scope

**Depth:** deep (cross-file call chain analysis, type consistency, error propagation)

**Files reviewed:**
1. `packages/domain/games/solitaire/modes.ts`
2. `packages/domain/games/solitaire/klondike/types.ts`
3. `packages/domain/games/solitaire/klondike/deal.ts`
4. `packages/domain/games/solitaire/klondike/game.ts`
5. `packages/domain/games/solitaire/klondike/game.test.ts`
6. `apps/web/src/features/games/solitaire/hooks/use-klondike-game.ts`
7. `apps/web/src/features/games/solitaire/components/klondike-board.tsx`
8. `apps/web/src/features/games/solitaire/components/solitaire-play-view.tsx`

**Supporting context read:** `rules.ts`, `deck.ts`, `klondike/index.ts`, `solitaire/index.ts`, `klondike-play-card.tsx`, `05-CONTEXT.md`, `05-UI-SPEC.md`, `05-VERIFICATION.md`

**Exclusions:** Non-source files, lock files, build artifacts.

## Summary

The Phase 5 implementation is largely sound in its core logic. The domain layer correctly implements draw-1 and draw-3 mechanics, and the UI layer correctly wires the mode selection to the draw count. However, the adversarial review found **7 warnings** and **2 info-level items** spanning four categories:

1. **State consistency bugs** — Mode switching on the play view silently fails to reset game state, and flipTopTableauCard mutates shared card objects through the shallow clone boundary.
2. **React anti-patterns** — Side-effect calls inside state updater functions, useState(initialState) fragility with changing useMemo values.
3. **Test coverage gaps** — Draw-3 interaction with tableau/foundation moves not tested.
4. **Code quality** — Fragile loop exit condition, nested calc() CSS that can be simplified.

No critical security vulnerabilities were found. The domain functions are pure (with one mutation caveat), no injection surfaces exist, and no hardcoded secrets are present.
---

## Findings

### W-01: Mode switch on play view silently uses wrong draw count

**Severity:** BLOCKER
**Files:**
- apps/web/src/features/games/solitaire/components/solitaire-play-view.tsx:73 (missing key prop)
- apps/web/src/features/games/solitaire/hooks/use-klondike-game.ts:60-67 (initialState via useMemo, ignored by useState)

**Issue:** When the mode query parameter changes between klondike-draw1 and klondike-draw3 on the play page (reachable via URL editing, browser back/forward navigation between play sessions, or nuqs SPA updates), useKlondikeGame receives a new drawCount parameter but the game state is NOT reset.

The root cause is a well-known React anti-pattern: React.useState(initialState) only uses initialState on the first render. When drawCount changes, the useMemo computing initialState re-runs with the correct new value, but useState silently ignores it. The component continues rendering with the old game state, which has drawCount from the previous mode.

**Reproduction:**
1. Open play view with mode=klondike-draw1 → game starts as draw-1
2. Edit URL to mode=klondike-draw3 → component re-renders, useKlondikeGame(3) called
3. useMemo creates fresh game with drawCount=3, but useState ignores it
4. Click stock to draw → applyKlondikeMove reads state.drawCount which is still 1
5. Only 1 card drawn instead of 3, despite mode saying draw-3

**Fix:** Add key={mode} to KlondikePlaySection to force remount:

```tsx
{isBoardLayout ? (
  <KlondikePlaySection key={mode} game={game} mode={mode} modeLabel={modeLabel} />
) : (...)}
```

---

### W-02: flipTopTableauCard mutates card objects across clone boundary

**Severity:** WARNING
**File:** packages/domain/games/solitaire/klondike/game.ts:76-80

**Issue:** cloneState does shallow array copies via [...column], so card objects are shared references between original state and clone. flipTopTableauCard sets top.faceUp = true on the shared object, mutating both states.

```typescript
function flipTopTableauCard(state: KlondikeState, index: number): void {
  const column = state.tableau[index]
  const top = column[column.length - 1]
  if (top && !top.faceUp) {
    top.faceUp = true  // mutates shared object reference
  }
}
```

Violates functional purity. If a caller holds a reference to the pre-move state, the card faceUp values are silently changed.

**Fix:** Replace assignment with new object:

```typescript
function flipTopTableauCard(state: KlondikeState, index: number): void {
  const column = state.tableau[index]
  const top = column[column.length - 1]
  if (top && !top.faceUp) {
    column[column.length - 1] = { ...top, faceUp: true }
  }
}
```
---

### W-03: Draw loop silently drops cards when stock.pop() returns undefined

**Severity:** WARNING
**File:** packages/domain/games/solitaire/klondike/game.ts:117-126

**Issue:** The draw action pops cards in a loop with a guard that silently hides inconsistencies:

```typescript
for (let i = 0; i < count; i++) {
  const drawn = next.stock.pop()
  if (drawn) {
    next.waste.push({ ...drawn, faceUp: true })
  }
}
```

If count exceeds stock.length (should not happen but if it does), fewer cards are drawn than expected. Function returns { ok: true } with truncated waste — silent data loss.

**Fix:** Use splice for atomic extraction:

```typescript
const drawn = next.stock.splice(-count, count)
next.waste.push(...drawn.map(card => ({ ...card, faceUp: true })))
```

---

### W-04: applyKlondikeAutoStack has fragile loop exit via continue

**Severity:** WARNING
**File:** packages/domain/games/solitaire/klondike/game.ts:187-208

**Issue:** When batch is empty, continue relies on changed=false to exit:

```typescript
while (changed && current.status !== "won") {
  changed = false
  if (batch.length === 0) { continue }  // exits because changed=false
}
```

If someone changes to while (changed || ...), infinite loop.

**Fix:** Use explicit break.

---

### W-05: useState ignores recomputed initialState on dependency change

**Severity:** WARNING
**File:** apps/web/src/features/games/solitaire/hooks/use-klondike-game.ts:60-67

**Issue:** Root cause of W-01. React.useState only uses initialState on first render. When drawCount changes, useMemo recomputes initialState but useState silently ignores it.

```typescript
const initialState = React.useMemo(() => { ... }, [storage, drawCount])
const [state, setState] = React.useState<KlondikeState>(initialState)
```

**Fix:** Add key={mode} to parent (W-01 fix) and/or add useEffect:

```typescript
React.useEffect(() => {
  setState(createKlondikeGame({ drawCount }))
  setSelection(null)
  setFeedback(null)
}, [drawCount])
```
---

### W-06: setFeedback called inside setState updater

**Severity:** WARNING
**File:** apps/web/src/features/games/solitaire/hooks/use-klondike-game.ts:107

**Issue:** applyMovesOnly calls setFeedback inside the setState updater:

```typescript
setState((current) => {
  // ...
  setFeedback(feedback)  // side effect inside updater
  return nextState
})
```

State updaters should be pure. In Strict Mode, updaters run twice.

**Fix:** Lift setFeedback out of the updater.

---

### W-07: Draw-3 tests do not cover post-draw interactions

**Severity:** WARNING
**File:** packages/domain/games/solitaire/klondike/game.test.ts:220-275

**Issue:** The draw-3 test suite only tests draw mechanics directly. Missing:

- Draw-3 then move waste card to tableau
- Draw-3 then auto-foundation on waste top card
- Draw-3 twice in a row (waste accumulation)
- Draw until stock equals drawCount exactly
- Recycle after draw-3 then draw again
- Win detection with drawCount=3

**Fix:** Add 3-4 test cases covering regression paths.

---

### I-01: Waste fan step uses nested calc()

**Severity:** INFO
**File:** apps/web/src/features/games/solitaire/components/klondike-board.tsx:100

**Issue:** left: calc(i * calc(var(--game-card-w) * 0.15)) is nested calc. Valid in modern browsers but unnecessarily complex.

**Fix:** left: calc(i * var(--game-card-w) * 0.15)

---

### I-02: Waste fan React key collision risk

**Severity:** INFO
**File:** apps/web/src/features/games/solitaire/components/klondike-board.tsx:98

**Issue:** Waste fan uses card.id as React key. Card IDs "card-0" through "card-51" are reused across new games, potentially causing React DOM node reuse issues if fly animations keep old cards in DOM.

**Fix:** Monitor. Add game generation counter key if animation artifacts appear.

---

## Recommendations

### Must Fix Before Ship
| # | Finding | Effort |
|---|---------|--------|
| 1 | W-01: Mode switch silently uses wrong draw count | 1 line |

### Should Fix
| # | Finding | Effort |
|---|---------|--------|
| 2 | W-02: flipTopTableauCard mutates shared objects | 1 line |
| 3 | W-03: Silent undefined guard in draw loop | 3 lines |
| 4 | W-05: useState ignores recomputed initialState | 1 line + optional useEffect |
| 5 | W-06: setFeedback inside setState updater | 3 lines |
| 6 | W-04: Fragile loop exit via continue | 1 line |

### Defer
| # | Finding | Action |
|---|---------|--------|
| 7 | W-07: Missing draw-3 interaction tests | Add tests next iteration |
| 8 | I-01: Nested calc() | Simplify CSS |
| 9 | I-02: Key collision risk | Monitor |

---

## Cross-File Verification

### Type Consistency
All type boundaries are consistent. drawCount flows correctly from SolitaireMode through hooks and domain functions.

### Error Propagation
- applyKlondikeMove errors: handled via { ok: false, reason } pattern
- storage errors: wrapped in try-catch by @pasttime/storage
- Deck exhaustion: defensive throw in dealKlondikeState

### State Mutation
Pre-existing mutation in flipTopTableauCard (W-02). All other operations are side-effect-free.

---

## Residual Risks

1. W-01 can cause incorrect game behavior under browser navigation.
2. flipTopTableauCard mutation is pre-existing, benign in practice but violates purity.
3. isKlondikeState does not validate array lengths (foundations=4, tableau=7).

## REVIEW COMPLETE

