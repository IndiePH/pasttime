"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import { hubSearchParams } from "@/features/hub/search-params"
import { cn } from "@/lib/utils"

export function HubGameSearch({ className }: { className?: string }) {
  const [query, setQuery] = useQueryState("q", hubSearchParams.q)

  return (
    <div className={cn("relative w-full sm:max-w-sm", className)}>
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="text"
        role="searchbox"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by title…"
        aria-label="Search games by title"
        className={cn(
          "h-9 w-full rounded-lg border border-border bg-background py-2 pr-9 pl-9 text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "dark:border-input dark:bg-input/30",
        )}
      />
      {query ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          aria-label="Clear search"
          onClick={() => setQuery("")}
        >
          <XIcon className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
