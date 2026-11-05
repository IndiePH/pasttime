import type { SVGProps } from "react"

const TILE = 5.4
const GAP = 0.9
const COLS = 3
const ROWS = 3
const BOARD_W = COLS * TILE + (COLS - 1) * GAP
const BOARD_H = ROWS * TILE + (ROWS - 1) * GAP
const ORIGIN_X = (24 - BOARD_W) / 2
const ORIGIN_Y = (24 - BOARD_H) / 2

const TILE_PAINT = {
  correct: { fill: "currentColor", fillOpacity: 1 },
  present: { fill: "currentColor", fillOpacity: 0.42 },
  absent: { fill: "none", stroke: "currentColor", strokeWidth: 1 },
} as const

const BOARD = [
  ["absent", "present", "absent"],
  ["correct", "present", "absent"],
  ["correct", "correct", "correct"],
] as const

/** Three-by-three letter tiles, the Word Guess board. */
export function WordGuessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      {BOARD.map((row, rowIndex) =>
        row.map((state, colIndex) => (
          <rect
            key={`${rowIndex}-${colIndex}`}
            x={ORIGIN_X + colIndex * (TILE + GAP)}
            y={ORIGIN_Y + rowIndex * (TILE + GAP)}
            width={TILE}
            height={TILE}
            rx="0.85"
            {...TILE_PAINT[state]}
          />
        )),
      )}
    </svg>
  )
}
