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
  buildKlondikeShareText,
  formatSolitaireModeLabel,
  parseSolitaireMode,
  SOLITAIRE_MODE_INFO,
  solitaireLaunchPath,
  type SolitaireMode,
  type SolitaireRoundMode,
} from "@pasttime/domain/games/solitaire"
import { formatPlayElapsed } from "@pasttime/domain/games/shared/play-clock"
import { GameBoardLoading } from "@/features/games/components/game-board-loading"
import { ComparativeRankingsList } from "@/features/games/components/comparative-rankings-list"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlaySection } from "@/features/games/components/game-play-section"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import {
  GamePostSolveActionStack,
  GamePostSolveDialog,
} from "@/features/games/components/game-post-solve-dialog"
import {
  buildGameShareUrl,
  GameShareCopyButton,
} from "@/features/games/components/game-share-copy-button"
import { useDailyPostSolveDialog } from "@/features/games/hooks/use-daily-post-solve-dialog"
import { usePostSolveRankings } from "@/features/games/hooks/use-post-solve-rankings"
import { SolitairePlayPreferencesProvider } from "@/features/games/solitaire/context/solitaire-play-preferences-context"
import { KlondikePlayCard } from "@/features/games/solitaire/components/klondike-play-card"
import { useKlondikeGame } from "@/features/games/solitaire/hooks/use-klondike-game"
import { solitaireSearchParams } from "@/features/games/solitaire/search-params"

interface SolitairePlayViewProps {
  game: GameDefinition
  modeLabel: string
}

function roundLabel(round: SolitaireRoundMode): string {
  return round === "daily" ? "Daily puzzle" : "Random puzzle"
}

function KlondikePlayInner({
  game,
  mode,
  round,
}: {
  game: GameDefinition
  mode: SolitaireMode
  round: SolitaireRoundMode
}) {
  const drawCount: 1 | 3 = mode === "klondike-draw3" ? 3 : 1
  const klondike = useKlondikeGame(drawCount, round)
  const isDailyWin =
    klondike.loadStatus === "ready" &&
    round === "daily" &&
    klondike.state.status === "won"
  const { open: resultsOpen, setOpen: setResultsOpen } =
    useDailyPostSolveDialog(isDailyWin)
  const rankings = usePostSolveRankings("solitaire", resultsOpen)
  const elapsedLabel = formatPlayElapsed(klondike.state.elapsedMs)
  const shareText = isDailyWin
    ? buildKlondikeShareText({
        drawCount,
        moves: klondike.state.moves,
        elapsedLabel,
        shareUrl: buildGameShareUrl("solitaire"),
      })
    : null

  if (klondike.loadStatus === "loading") {
    return <GameBoardLoading label="Dealing cards…" />
  }

  return (
    <GamePlaySection
      game={game}
      subtitle={`${formatSolitaireModeLabel(mode)} · ${roundLabel(round)}`}
      headerDensity="compact"
      contentLayout="board"
      footer={
        <GamePlayFooterActions>
          {round === "random" ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={klondike.newGame}
            >
              New game
            </Button>
          ) : null}
          <Button variant="outline" className="w-full" asChild>
            <PlatformLink href={solitaireLaunchPath(mode)}>
              Back to setup
            </PlatformLink>
          </Button>
        </GamePlayFooterActions>
      }
    >
      <KlondikePlayCard session={klondike} />
      <GamePostSolveDialog
        open={resultsOpen}
        onOpenChange={setResultsOpen}
        title="Nice work!"
        description={`${klondike.state.moves} moves · ${elapsedLabel}`}
        footer={
          <GamePostSolveActionStack>
            {shareText ? (
              <GameShareCopyButton
                shareText={shareText}
                className="w-full gap-2"
              />
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setResultsOpen(false)}
            >
              Close
            </Button>
          </GamePostSolveActionStack>
        }
      >
        <ComparativeRankingsList rankings={rankings} />
      </GamePostSolveDialog>
    </GamePlaySection>
  )
}

function KlondikePlaySection({
  game,
  mode,
  round,
}: {
  game: GameDefinition
  mode: SolitaireMode
  round: SolitaireRoundMode
}) {
  return (
    <SolitairePlayPreferencesProvider>
      <KlondikePlayInner game={game} mode={mode} round={round} />
    </SolitairePlayPreferencesProvider>
  )
}

export function SolitairePlayView({ game, modeLabel }: SolitairePlayViewProps) {
  const [modeParam] = useQueryState("mode", solitaireSearchParams.mode)
  const [roundParam] = useQueryState("round", solitaireSearchParams.round)
  const mode = parseSolitaireMode(modeParam)
  const round = roundParam
  const { tagline } = SOLITAIRE_MODE_INFO[mode]
  const isBoardLayout = mode === "klondike-draw1" || mode === "klondike-draw3"

  return (
    <GamePlayShell layout={isBoardLayout ? "board" : "default"}>
      {isBoardLayout ? (
        <KlondikePlaySection
          key={`${mode}:${round}`}
          game={game}
          mode={mode}
          round={round}
        />
      ) : (
        <GamePlaySection
          game={game}
          subtitle={`${formatSolitaireModeLabel(mode)} · ${modeLabel}`}
          footer={
            <GamePlayFooterActions>
              <Button variant="outline" className="w-full" asChild>
                <PlatformLink href={solitaireLaunchPath(mode)}>
                  Back to setup
                </PlatformLink>
              </Button>
            </GamePlayFooterActions>
          }
        >
          <Card className="w-full text-left">
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
        </GamePlaySection>
      )}
    </GamePlayShell>
  )
}
