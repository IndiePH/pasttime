import type { SVGProps } from "react"

export function SampleCrewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="48" height="48" rx="10" className="fill-muted" />
      <circle cx="16" cy="20" r="4.5" className="fill-primary/75" />
      <circle cx="32" cy="20" r="4.5" className="fill-primary/75" />
      <circle cx="24" cy="14" r="4" className="fill-primary/55" />
      <path
        d="M7 36c0-5 4.5-8 9-8s9 3 9 8M23 36c0-5 4.5-8 9-8s9 3 9 8"
        className="stroke-primary/65"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
