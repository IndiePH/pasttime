"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GameContentPanel } from "@/features/games/components/game-content-panel"
import { KlondikeBoard } from "@/features/games/solitaire/components/klondike-board"
import type { useKlondikeGame } from "@/features/games/solitaire/hooks/use-klondike-game"
import { cn } from "@/lib/utils"

const SIDE_INSET = "calc(var(--game-card-w) * 0.35)"

type KlondikeGameSession = ReturnType<typeof useKlondikeGame>

interface KlondikePlayCardProps {
  game: KlondikeGameSession
}

export function KlondikePlayCard({ game }: KlondikePlayCardProps) {

  return (
    <Card className="klondike-vars mx-auto overflow-visible text-left">
      <CardHeader
        className="gap-3 pt-2 landscape:flex-row landscape:items-start landscape:justify-between landscape:space-y-0"
        style={{ paddingInline: SIDE_INSET }}
      >
        <div className="space-y-1.5">
          <CardTitle>Klondike</CardTitle>
          <CardDescription className="max-w-2xl landscape:hidden">
            Build four suited foundations from ace to king. Tap stock to draw,
            select a card, then tap a valid destination. Double-tap to
            auto-move to foundation.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2 py-0.5 text-sm landscape:justify-end">
          <Badge variant="outline" className="leading-normal">
            Moves {game.state.moves}
          </Badge>
          <Badge variant="outline" className="leading-normal">
            {game.state.status === "won" ? "Won" : "Playing"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-0 pt-4 pb-2 landscape:space-y-3 landscape:pt-3 landscape:pb-2">
        <GameContentPanel sideInset={SIDE_INSET} className="pb-2.5">
          <KlondikeBoard
            state={game.state}
            selection={game.selection}
            drawOrRecycle={game.drawOrRecycle}
            autoFoundation={game.autoFoundation}
            handleTableauCardClick={game.handleTableauCardClick}
            handleWasteClick={game.handleWasteClick}
            handleFoundationClick={game.handleFoundationClick}
            handleEmptyTableauClick={game.handleEmptyTableauClick}
            moveCards={game.moveCards}
            selectFrom={game.selectFrom}
            clearSelection={game.clearSelection}
            autoComplete={game.autoComplete}
          />
        </GameContentPanel>

        <div
          className="flex flex-col items-center gap-2"
          style={{ paddingInline: SIDE_INSET }}
        >
          <p
            className="min-h-5 w-full text-center text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {game.feedback ?? "\u00A0"}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={game.clearSelection}
            className={cn(!game.selection && "invisible pointer-events-none")}
            tabIndex={game.selection ? 0 : -1}
            aria-hidden={!game.selection}
          >
            Clear selection
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
