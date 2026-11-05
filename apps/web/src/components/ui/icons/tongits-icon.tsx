import type { SVGProps } from "react"

const FAN = [
  { angle: -32, fill: "none" as const, fillOpacity: 0 },
  { angle: 0, fill: "currentColor" as const, fillOpacity: .9 },
  { angle: 32, fill: "currentColor" as const, fillOpacity: 1 },
]

/** Three cards in an even fan. Left is an outline. Middle and right are solid, with the right card on top. */
export function TongitsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <g transform="translate(12 12) scale(0.9) translate(-12 -12)">
      <g transform="translate(12 21)">
        {FAN.map((card) => (
          <g key={card.angle} transform={`rotate(${card.angle})`}>
            <rect
              x="-3.5"
              y="-16.2"
              width="7"
              height="13.6"
              rx="1.05"
              stroke="currentColor"
              strokeWidth="1.2"
              fill={card.fill}
              fillOpacity={card.fillOpacity}
            />
          </g>
        ))}
      </g>
      </g>
    </svg>
  )
}
