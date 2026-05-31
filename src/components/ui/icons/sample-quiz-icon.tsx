import type { SVGProps } from "react"

export function SampleQuizIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="48" height="48" rx="10" className="fill-muted" />
      <circle cx="17" cy="18" r="5" className="fill-primary/70" />
      <circle cx="31" cy="18" r="5" className="fill-primary/70" />
      <path
        d="M8 34c0-4.5 4-7 9-7s9 2.5 9 7"
        className="stroke-primary/70"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M22 34c0-4.5 4-7 9-7s9 2.5 9 7"
        className="stroke-primary/45"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="19"
        y="26"
        width="10"
        height="6"
        rx="2"
        className="fill-primary/35"
      />
    </svg>
  )
}
