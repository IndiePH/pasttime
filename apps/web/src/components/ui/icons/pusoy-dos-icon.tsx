import type { SVGProps } from "react"

/** A 2 and a diamond, side by side, inside a square outline. */
export function PusoyDosIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        x="2.15"
        y="2.15"
        width="19.7"
        height="19.7"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <g transform="translate(1.15 -0.4)">
        <text
          x="4.7"
          y="16.15"
          fill="currentColor"
          fontSize="10"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          2
        </text>
        <path
          d="M14.05 9.5 17.05 12.5 14.05 15.5 11.05 12.5Z"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
