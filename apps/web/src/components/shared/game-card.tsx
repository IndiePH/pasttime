import { PlatformLink } from "@/platform/navigation"
import { UsersIcon } from "lucide-react"

import { GameIcon } from "@/components/ui/icons"
import type { GameDefinition } from "@pasttime/domain/games"
import { gamePath, getGameCardHeaderClass } from "@pasttime/domain/games"
import { cn } from "@/lib/utils"

const CARD_SIZE_STYLES = {
  default: {
    header: "shrink-0 px-4 pt-6 pb-5",
    iconFrame: "mb-4 size-[4.5rem]",
    icon: "size-[3.25rem]",
    title: "text-[1.5rem]",
    body: "shrink-0 gap-2 px-4 pt-3.5 pb-4",
    description: "line-clamp-2 min-h-10 text-sm leading-5",
    player: "text-xs",
    playerIcon: "size-3.5",
  },
  compact: {
    header: "shrink-0 px-3 pt-4 pb-3",
    iconFrame: "mb-2.5 size-14",
    icon: "size-10",
    title: "text-[1.2rem]",
    body: "shrink-0 gap-1.5 px-3 pt-2.5 pb-3",
    description: "line-clamp-2 min-h-9 text-xs leading-[1.125rem]",
    player: "text-[0.7rem]",
    playerIcon: "size-3",
  },
} as const

export type GameCardSize = keyof typeof CARD_SIZE_STYLES

const GAME_CARD_SURFACE = "bg-game-card-surface"

/** Representative copy so ad tile body height matches a typical game card. */
const AD_MATCH_PLACEHOLDER = {
  title: "Sample Quiz",
  description: "Race friends to answer trivia questions.",
  playerCount: "2–8 players",
} as const

/** Shell classes so hub ad tiles match game card footprint. */
export function getGameCardAdMatchClasses(size: GameCardSize) {
  const styles = CARD_SIZE_STYLES[size]

  return {
    article:
      "relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-dashed border-border/80 bg-game-card-surface",
    header: cn(
      "flex flex-col items-center text-center bg-muted/50",
      styles.header,
    ),
    iconFrame: cn(
      "grid aspect-square shrink-0 place-items-center rounded-md bg-black/25 ring-1 ring-inset ring-white/20",
      styles.iconFrame,
    ),
    title: cn(
      "font-game-title leading-none font-bold tracking-tight",
      styles.title,
    ),
    body: cn(
      "flex flex-col border-t border-border text-left",
      GAME_CARD_SURFACE,
      styles.body,
    ),
    description: cn("text-muted-foreground", styles.description),
    player: cn(
      "flex items-center gap-1.5 font-medium text-foreground/70",
      styles.player,
    ),
    playerIcon: cn("shrink-0", styles.playerIcon),
    placeholder: AD_MATCH_PLACEHOLDER,
  }
}

export function GameCard({
  game,
  className,
  size = "default",
}: {
  game: GameDefinition
  className?: string
  size?: GameCardSize
}) {
  const isComingSoon = game.status === "coming_soon"
  const styles = CARD_SIZE_STYLES[size]

  return (
    <PlatformLink
      href={gamePath(game.id)}
      className={cn(
        "group block w-full rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <article
        className={cn(
          "flex flex-col overflow-hidden rounded-lg border border-border",
          GAME_CARD_SURFACE,
          "shadow-sm transition-shadow hover:shadow-md",
          isComingSoon && "opacity-90",
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center text-center",
            styles.header,
            getGameCardHeaderClass(game.icon),
          )}
        >
          <div
            className={cn(
              "grid aspect-square shrink-0 place-items-center rounded-md bg-black/25 ring-1 ring-inset ring-white/20",
              styles.iconFrame,
            )}
            aria-hidden
          >
            <GameIcon
              id={game.icon}
              className={cn(
                styles.icon,
                "[&_rect:first-child]:hidden",
                "[&_rect:not(:first-child)]:fill-white/90",
                "[&_circle]:fill-white/85",
                "[&_path]:stroke-white/80",
              )}
            />
          </div>
          <h3
            className={cn(
              "font-game-title leading-none font-bold tracking-tight text-white",
              styles.title,
            )}
          >
            {game.title}
          </h3>
        </div>
        <div
          className={cn(
            "flex flex-col border-t border-border text-left",
            GAME_CARD_SURFACE,
            styles.body,
          )}
        >
          <p className={cn("text-muted-foreground", styles.description)}>
            {game.description}
          </p>
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-foreground/70",
              styles.player,
            )}
          >
            {isComingSoon ? (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                Coming soon
              </span>
            ) : null}
            {game.playerCount ? (
              <span className="inline-flex items-center gap-1.5">
                <UsersIcon
                  className={cn("shrink-0", styles.playerIcon)}
                  aria-hidden
                />
                <span>{game.playerCount}</span>
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </PlatformLink>
  )
}
