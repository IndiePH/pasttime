import { GameIcon } from "@/components/ui/icons"
import type { GameDefinition } from "@pasttime/domain/games"
import { cn } from "@/lib/utils"

interface GameSessionHeaderProps {
  game: GameDefinition
  subtitle?: string
  density?: "default" | "compact"
}

export function GameSessionHeader({
  game,
  subtitle,
  density = "default",
}: GameSessionHeaderProps) {
  const isCompact = density === "compact"

  return (
    <header
      className={cn(
        "flex flex-col items-center text-center",
        isCompact &&
          "landscape:flex-row landscape:items-center landscape:justify-between landscape:gap-4 landscape:text-left",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center text-center",
          isCompact &&
            "landscape:flex-row landscape:items-center landscape:gap-3 landscape:text-left",
        )}
      >
        <GameIcon
          id={game.icon}
          className={cn(
            "rounded-2xl",
            isCompact
              ? "size-14 landscape:size-11"
              : "size-20",
          )}
          title={game.title}
        />
        <div>
          <h1
            className={cn(
              "font-semibold tracking-tight",
              isCompact
                ? "mt-2 text-xl landscape:mt-0 landscape:text-lg"
                : "mt-2 text-2xl",
            )}
          >
            {game.title}
          </h1>
          {subtitle ? (
            <p
              className={cn(
                "text-muted-foreground",
                isCompact
                  ? "mt-1 text-sm landscape:mt-0"
                  : "mt-2",
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  )
}
