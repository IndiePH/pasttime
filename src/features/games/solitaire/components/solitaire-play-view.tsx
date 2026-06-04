"use client"

import Link from "next/link"
import { useQueryState } from "nuqs"

import { AdPanel } from "@/components/shared/ad-panel"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@/domain/games"
import {
  formatSolitaireModeLabel,
  parseSolitaireMode,
  SOLITAIRE_MODE_INFO,
  solitaireLaunchPath,
} from "@/domain/games/solitaire"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { solitaireSearchParams } from "@/features/games/solitaire/search-params"

interface SolitairePlayViewProps {
  game: GameDefinition
  modeLabel: string
}

export function SolitairePlayView({ game, modeLabel }: SolitairePlayViewProps) {
  const [modeParam] = useQueryState("mode", solitaireSearchParams.mode)
  const mode = parseSolitaireMode(modeParam)
  const { tagline } = SOLITAIRE_MODE_INFO[mode]

  return (
    <GamePageShell>
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
            Game board for {formatSolitaireModeLabel(mode)} will load here.
          </div>
        </CardContent>
      </Card>
      <Button variant="outline" className="mt-8" asChild>
        <Link href={solitaireLaunchPath(mode)}>Back to launch options</Link>
      </Button>
      <AdPanel
        slot="game-below-launch"
        variant="box"
        className="mt-10 w-full"
      />
    </GamePageShell>
  )
}
