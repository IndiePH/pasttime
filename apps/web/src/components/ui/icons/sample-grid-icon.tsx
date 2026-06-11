import type { SVGProps } from "react"

import { cn } from "@/lib/utils"

export function SampleGridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="48" height="48" rx="10" className="fill-muted" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={10 + col * 8}
            y={10 + row * 8}
            width="6"
            height="6"
            rx="1"
            className={cn(
              (row + col) % 2 === 0 ? "fill-primary/70" : "fill-primary/35",
            )}
          />
        )),
      )}
    </svg>
  )
}
