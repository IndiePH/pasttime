"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import { parseSolitaireMode } from "@pasttime/domain/games/solitaire"
import {
  SOLITAIRE_MODE_INFO,
  type SolitaireMode,
} from "@pasttime/domain/games/solitaire"
import { solitaireSearchParams } from "@/features/games/solitaire/search-params"

interface SolitaireHowToPlayProps {
  game: GameDefinition
}

function KlondikeRules({ drawCount }: { drawCount: 1 | 3 }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Build all four foundations from Ace to King by suit. The tableau
        columns alternate colors in descending order.
      </p>

      <section>
        <h3 className="font-medium">How a turn works</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Tap the stock pile to draw {drawCount === 1 ? "a card" : "up to three cards"} into the waste pile.
          </li>
          <li>
            Tap a card in the waste, tableau, or foundation to select it, then
            tap a valid destination to move it.
          </li>
          <li>
            You can also drag a card directly to its destination. Double-tap a
            card to auto-move it to a foundation.
          </li>
        </ol>
      </section>

      <section>
        <h3 className="font-medium">Rules</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            <strong>Tableau:</strong> Build columns down, alternating red and
            black suits. You can move a sequence of face-up cards that are in
            order.
          </li>
          <li>
            <strong>Foundations:</strong> Build up from Ace to King, one suit
            per foundation. A full foundation is complete.
          </li>
          <li>
            <strong>Stock:</strong> When the stock is empty, tap it to recycle
            the waste pile back into stock.
          </li>
          <li>
            <strong>Empty tableau slot:</strong> Only a King (or a sequence
            starting with a King) can be placed in an empty tableau column.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-medium">Tips</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Try to keep tableau columns balanced. Avoid burying cards you need.
          </li>
          <li>
            With auto-stack on, playable cards move to foundations automatically
            after each move.
          </li>
        </ul>
      </section>
    </div>
  )
}

function PyramidRules() {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Clear the pyramid by removing pairs of cards that sum to 13. Remove
        Kings (value 13) on their own.
      </p>

      <section>
        <h3 className="font-medium">How a turn works</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Tap two uncovered cards in the pyramid whose values add up to 13 to
            remove them.
          </li>
          <li>
            A King (value 13) can be removed by tapping it on its own.
          </li>
          <li>
            Draw from the stock when you have no matches in the pyramid.
          </li>
        </ol>
      </section>

      <section>
        <h3 className="font-medium">Card values</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Ace = 1, 2–10 = face value, Jack = 11, Queen = 12, King = 13</li>
          <li>Any pair that sums to 13 can be removed (e.g., 5+8, Queen+Ace)</li>
        </ul>
      </section>

      <section>
        <h3 className="font-medium">Rules</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Only uncovered cards (not overlapped by another card) are playable.
          </li>
          <li>
            Cards drawn from stock cannot be returned to the stock.
          </li>
          <li>
            You win when all cards in the pyramid and stock have been removed.
          </li>
        </ul>
      </section>
    </div>
  )
}

function TriPeaksRules() {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Remove all cards from three peaks by playing cards that are one rank
        higher or lower than the waste.
      </p>

      <section>
        <h3 className="font-medium">How a turn works</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Tap any uncovered card on the peaks that is one rank higher or
            lower than the top of the waste pile.
          </li>
          <li>
            The tapped card moves to the waste pile, revealing cards beneath it.
          </li>
          <li>
            Draw from the stock when no card on the peaks can be played.
          </li>
        </ol>
      </section>

      <section>
        <h3 className="font-medium">Rules</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Only uncovered cards (not overlapped) on the peaks can be selected.
          </li>
          <li>
            Aces are both high and low. You can play a 2 or a King on an Ace.
          </li>
          <li>
            Suit and color do not matter, only rank adjacency.
          </li>
          <li>
            You win when all cards from the peaks and stock have been removed.
          </li>
        </ul>
      </section>
    </div>
  )
}

function FreeCellRules() {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        All cards are face up from the start. Use four free cells to
        temporarily hold cards as you build the four foundations.
      </p>

      <section>
        <h3 className="font-medium">How a turn works</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Tap a card to select it, then tap a valid destination (tableau,
            free cell, or foundation) to move it.
          </li>
          <li>
            Free cells can each hold one card as a temporary workspace.
          </li>
          <li>
            Build tableau columns in descending order with alternating colors
            (like Klondike).
          </li>
        </ol>
      </section>

      <section>
        <h3 className="font-medium">Rules</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            You can move multiple cards at once from a tableau column, as long
            as you have enough free cells and empty tableau slots.
          </li>
          <li>
            Each free cell holds at most one card. A card in a free cell can be
            moved to a tableau column or a foundation.
          </li>
          <li>
            Foundations build up from Ace to King by suit.
          </li>
          <li>
            Nearly every deal is winnable with good strategy.
          </li>
        </ul>
      </section>
    </div>
  )
}

function RulesPicker({ mode }: { mode: SolitaireMode }) {
  switch (mode) {
    case "klondike-draw1":
      return <KlondikeRules drawCount={1} />
    case "klondike-draw3":
      return <KlondikeRules drawCount={3} />
    case "pyramid":
      return <PyramidRules />
    case "tripeaks":
      return <TriPeaksRules />
    case "freecell":
      return <FreeCellRules />
  }
}

export function SolitaireHowToPlay({ game }: SolitaireHowToPlayProps) {
  void game
  const [modeParam] = useQueryState("mode", solitaireSearchParams.mode)
  const mode = parseSolitaireMode(modeParam)

  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">
        <strong>{SOLITAIRE_MODE_INFO[mode].label}:</strong>{" "}
        {SOLITAIRE_MODE_INFO[mode].tagline}
      </p>

      <RulesPicker mode={mode} />

      <p className="text-xs text-muted-foreground">
        Change game mode anytime from Settings before starting a new game.
      </p>
    </div>
  )
}
