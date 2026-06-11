import { PlatformLink } from "@/platform/navigation"

import { ModeToggle } from "@/components/shared/mode-toggle"
import { cn } from "@/lib/utils"

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <PlatformLink
          href="/"
          className="font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          Pasttime
        </PlatformLink>
        <nav className="flex items-center gap-1" aria-label="Main">
          <PlatformLink
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Browse
          </PlatformLink>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
