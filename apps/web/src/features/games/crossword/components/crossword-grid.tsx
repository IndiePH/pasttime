import { cn } from "@/lib/utils"
import type { CrosswordCell } from "@pasttime/domain/games/crossword"

interface CrosswordGridProps {
  gridSize: number
  inputs: Record<string, string>
  activeCell?: { row: number; col: number }
  showErrors?: boolean
  onCellChange: (row: number, col: number, value: string) => void
  onCellClick: (row: number, col: number) => void
  blocks: Array<{ row: number; col: number }>
  gridData: CrosswordCell[][]
}

export function CrosswordGrid({
  gridSize,
  inputs,
  activeCell,
  showErrors = false,
  onCellChange,
  onCellClick,
  blocks,
  gridData,
}: CrosswordGridProps) {
  const blockSet = new Set(blocks.map((b) => `${b.row},${b.col}`))

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
      onCellChange(row, col, e.key.toUpperCase())
    } else if (e.key === "Backspace" || e.key === "Delete") {
      onCellChange(row, col, "")
    } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault()
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0],
      }
      const [dr, dc] = delta[e.key]
      const nr = row + dr
      const nc = col + dc
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !blockSet.has(`${nr},${nc}`)) {
        onCellClick(nr, nc)
        const nextIdx = nr * gridSize + nc
        const nextCell = (e.currentTarget as HTMLElement).parentElement?.children[nextIdx] as HTMLElement
        nextCell?.focus()
      }
    }
  }

  return (
    <div
      className="crossword-grid grid gap-px"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, var(--crossword-cell-w))`,
        gridTemplateRows: `repeat(${gridSize}, var(--crossword-cell-w))`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, i) => {
        const row = Math.floor(i / gridSize)
        const col = i % gridSize
        const key = `${row},${col}`
        const isBlock = blockSet.has(key)
        const isActive = activeCell?.row === row && activeCell?.col === col
        const value = inputs[key] || ""
        const cellData = gridData?.[row]?.[col]
        const clueNum = cellData?.clueNumber

        // Error only when the player has typed something that disagrees with
        // the answer and the "show errors" toggle is on. Empty cells are never
        // errors, so the answer isn't leaked.
        const isError =
          !isBlock &&
          showErrors &&
          value.length > 0 &&
          cellData?.answerLetter !== undefined &&
          value.toUpperCase() !== cellData.answerLetter

        return (
          <div
            key={key}
            className={cn(
              "crossword-cell text-center text-lg font-semibold tracking-wide uppercase",
              "relative transition-colors duration-150",
              isBlock
                ? "cursor-not-allowed bg-muted/30"
                : "cursor-pointer border border-border bg-game-card-surface dark:bg-game-card-surface/90",
              !isBlock &&
                isActive &&
                "border-foreground ring-2 ring-ring dark:border-white",
              !isBlock &&
                !isActive &&
                "hover:border-foreground/50 dark:hover:border-white/50",
              isError &&
                "border-destructive/60 bg-destructive/10 text-destructive dark:border-destructive dark:text-destructive",
            )}
            onClick={(e) => { if (!isBlock) { (e.currentTarget as HTMLElement).focus(); onCellClick(row, col) } }}
            onKeyDown={(e) => !isBlock && handleKeyDown(e, row, col)}
            tabIndex={!isBlock ? 0 : -1}
            role="gridcell"
            aria-selected={isActive}
            aria-invalid={isError || undefined}
          >
            {!isBlock && (
              <>
                {clueNum ? (
                  <span className="absolute top-0.5 left-0.5 text-[10px] leading-none font-normal">
                    {clueNum}
                  </span>
                ) : null}
                <span className="flex h-full w-full items-center justify-center">
                  {value || "\u00A0"}
                </span>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
