import type { SVGProps } from "react"

export function WordGuessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="48" height="48" rx="10" className="fill-muted" />
      <rect x="10" y="14" width="8" height="8" rx="1.5" className="fill-primary/80" />
      <rect x="20" y="14" width="8" height="8" rx="1.5" className="fill-primary/50" />
      <rect x="30" y="14" width="8" height="8" rx="1.5" className="fill-primary/30" />
      <rect x="10" y="26" width="8" height="8" rx="1.5" className="fill-primary/30" />
      <rect x="20" y="26" width="8" height="8" rx="1.5" className="fill-primary/80" />
      <rect x="30" y="26" width="8" height="8" rx="1.5" className="fill-primary/50" />
    </svg>
  )
}
