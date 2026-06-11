import { UsersIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import {
  getGameCardAdMatchClasses,
  type GameCardSize,
} from "@/components/shared/game-card"
import { cn } from "@/lib/utils"

export type AdPanelVariant = "strip" | "box" | "card"

interface AdPanelProps {
  slot: string
  variant?: AdPanelVariant
  className?: string
  matchGameCardSize?: GameCardSize
}

function AdPanelContent({ slot }: { slot: string }) {
  return (
    <>
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
        Ad placeholder
      </span>
      <span className="text-xs text-muted-foreground">{slot}</span>
    </>
  )
}

export function AdPanel({
  slot,
  variant = "strip",
  className,
  matchGameCardSize,
}: AdPanelProps) {
  if (variant === "card") {
    if (matchGameCardSize) {
      const shell = getGameCardAdMatchClasses(matchGameCardSize)
      const { placeholder } = shell

      return (
        <aside
          aria-label={`Advertisement: ${slot}`}
          data-ad-slot={slot}
          className={cn(
            "block w-full rounded-lg outline-none",
            className,
          )}
        >
          <div className={shell.article}>
            <div className={shell.header} aria-hidden>
              <div className={cn(shell.iconFrame, "invisible")} />
              <h3 className={cn(shell.title, "invisible")}>
                {placeholder.title}
              </h3>
            </div>
            <div className={shell.body} aria-hidden>
              <p className={cn(shell.description, "invisible")}>
                {placeholder.description}
              </p>
              <div className={cn(shell.player, "invisible")}>
                <UsersIcon className={shell.playerIcon} />
                <span>{placeholder.playerCount}</span>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3 text-center">
              <AdPanelContent slot={slot} />
            </div>
          </div>
        </aside>
      )
    }

    return (
      <aside
        aria-label={`Advertisement: ${slot}`}
        data-ad-slot={slot}
        className={cn("block h-full", className)}
      >
        <Card
          size="sm"
          className="flex h-full flex-col items-center justify-center gap-1 border border-dashed border-border/80 bg-muted/40 text-center ring-0"
        >
          <AdPanelContent slot={slot} />
        </Card>
      </aside>
    )
  }

  return (
    <aside
      aria-label={`Advertisement: ${slot}`}
      data-ad-slot={slot}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/80 bg-muted/40 px-4 text-center",
        variant === "strip" && "min-h-[90px] w-full py-4",
        variant === "box" && "mx-auto aspect-[4/3] w-full max-w-sm py-6",
        className,
      )}
    >
      <AdPanelContent slot={slot} />
    </aside>
  )
}
