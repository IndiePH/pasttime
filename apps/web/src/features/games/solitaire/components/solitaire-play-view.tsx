"use client"

import { PlatformLink } from "@/platform/navigation"
import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@pasttime/domain/games"
import {
  formatSolitaireModeLabel,
  parseSolitaireMode,
  SOLITAIRE_MODE_INFO,
  solitaireLaunchPath,
  type SolitaireMode,
} from "@pasttime/domain/games/solitaire"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { KlondikePlayCard } from "@/features/games/solitaire/components/klondike-play-card"
import { useKlondikeGame } from "@/features/games/solitaire/hooks/use-klondike-game"
import { solitaireSearchParams } from "@/features/games/solitaire/search-params"

interface SolitairePlayViewProps {
  game: GameDefinition
  modeLabel: string
}

function KlondikePlaySection({
  game,
  mode,
  modeLabel,
}: {
  game: GameDefinition
  mode: SolitaireMode
  modeLabel: string
}) {
  const klondike = useKlondikeGame()

  return (
    <>
      <GameSessionHeader
        game={game}
        subtitle={`${formatSolitaireModeLabel(mode)} · ${modeLabel}`}
        density="compact"
      />
      <div className="mt-4 w-fit max-w-full landscape:mt-3">
        <KlondikePlayCard game={klondike} />
      </div>
      <GamePlayFooterActions>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={klondike.newGame}
        >
          New game
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <PlatformLink href={solitaireLaunchPath(mode)}>
            Back to launch options
          </PlatformLink>
        </Button>
      </GamePlayFooterActions>
    </>
  )
}

export function SolitairePlayView({ game, modeLabel }: SolitairePlayViewProps) {
  const [modeParam] = useQueryState("mode", solitaireSearchParams.mode)
  const mode = parseSolitaireMode(modeParam)
  const { tagline } = SOLITAIRE_MODE_INFO[mode]
  const isBoardLayout = mode === "klondike"

  return (
    <GamePlayShell layout={isBoardLayout ? "board" : "default"}>
      {isBoardLayout ? (
        <KlondikePlaySection game={game} mode={mode} modeLabel={modeLabel} />
      ) : (
        <>
          <GameSessionHeader
            game={game}
            subtitle={`${formatSolitaireModeLabel(mode)} · ${modeLabel}`}
          />
          <Card className="mt-8 w-full text-left">
            <CardHeader>
              <CardTitle>{formatSolitaireModeLabel(mode)}</CardTitle>
              <CardDescription>{tagline}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                {formatSolitaireModeLabel(mode)} gameplay is coming soon.
              </div>
            </CardContent>
          </Card>
          <GamePlayFooterActions>
            <Button variant="outline" className="w-full" asChild>
              <PlatformLink href={solitaireLaunchPath(mode)}>
                Back to launch options
              </PlatformLink>
            </Button>
          </GamePlayFooterActions>
        </>
      )}
    </GamePlayShell>
  )
}
