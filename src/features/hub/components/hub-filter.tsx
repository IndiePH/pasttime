"use client"

import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import type { StatusFilter } from "@/domain/games"
import { hubSearchParams } from "@/features/hub/search-params"
import { cn } from "@/lib/utils"

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "coming_soon", label: "Coming soon" },
]

export function HubFilter({ className }: { className?: string }) {
  const [status, setStatus] = useQueryState("status", hubSearchParams.status)

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label="Filter games by status"
    >
      {FILTERS.map(({ value, label }) => {
        const isActive = status === value
        return (
          <Button
            key={value}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            aria-current={isActive ? "true" : undefined}
            onClick={() => setStatus(value)}
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}
