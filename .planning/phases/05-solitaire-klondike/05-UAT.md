---
status: testing
phase: 05-solitaire-klondike
source: [05-VERIFICATION.md]
started: 2026-07-02
updated: 2026-07-02
---

## Current Test

number: 1
name: Draw-3 waste fan visual display
expected: |
  The fanned/offset stack renders correctly across viewport sizes. 
  Draw-3 mode shows up to 3 offset cards. Draw-1 mode shows a single card.
awaiting: user response

## Tests

### 1. Draw-3 waste fan visual display
expected: Verify the fanned/offset stack renders correctly across viewport sizes. Draw-3 mode shows up to 3 offset cards. Draw-1 mode shows a single card (no fan).
result: [pending]

### 2. Drag-and-drop from waste fan
expected: Confirm only top waste card is interactable. Drag initiation is smooth. Lower fan cards do not respond to clicks or drag.
result: [pending]

### 3. Mode picker shows both Klondike Draw 1 and Klondike Draw 3
expected: At solitaire launch view, the mode picker displays both "Klondike Draw 1" and "Klondike Draw 3". Selecting either starts a game in the correct mode.
result: [pending]

### 4. Screen reader draw feedback
expected: After drawing from stock, screen reader announces "Drew 1 card" or "Drew N cards" appropriately via the existing aria-live region.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
