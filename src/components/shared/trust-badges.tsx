import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TRUST_ITEMS = [
  "Instant play",
  "No download",
  "Mobile & desktop",
  "Free to play",
] as const

export function TrustBadges({ className }: { className?: string }) {
  return (
    <ul
      className={cn("flex flex-wrap justify-start gap-2", className)}
      aria-label="Features"
    >
      {TRUST_ITEMS.map((label) => (
        <li key={label}>
          <Badge variant="secondary" className="font-normal">
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
