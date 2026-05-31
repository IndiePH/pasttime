import type { SVGProps } from "react"

export function SampleTilesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="48" height="48" rx="10" className="fill-muted" />
      <rect x="11" y="11" width="12" height="12" rx="2" className="fill-primary/80" />
      <rect x="25" y="11" width="12" height="12" rx="2" className="fill-primary/35" />
      <rect x="11" y="25" width="12" height="12" rx="2" className="fill-primary/35" />
      <rect x="25" y="25" width="12" height="12" rx="2" className="fill-primary/80" />
    </svg>
  )
}
