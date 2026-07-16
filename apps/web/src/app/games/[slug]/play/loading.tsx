import { SiteShell } from "@/components/shared"
import { GameBoardLoading } from "@/features/games/components/game-board-loading"
import { GamePlayShell } from "@/features/games/components/game-play-shell"

export default function GamePlayLoading() {
  return (
    <SiteShell>
      <GamePlayShell layout="board">
        <GameBoardLoading />
      </GamePlayShell>
    </SiteShell>
  )
}
