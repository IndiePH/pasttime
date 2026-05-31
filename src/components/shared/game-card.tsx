import Link from "next/link"

import { GameIcon } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@/domain/games"
import { gamePath } from "@/domain/games"
import { cn } from "@/lib/utils"

function formatMeta(game: GameDefinition): string | null {
  const parts = [game.playerCount, game.duration].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : null
}

export function GameCard({
  game,
  className,
  featured = false,
}: {
  game: GameDefinition
  className?: string
  featured?: boolean
}) {
  const meta = formatMeta(game)
  const isAvailable = game.status === "available"

  return (
    <Link
      href={gamePath(game.id)}
      className={cn(
        "group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <Card
        size="sm"
        className={cn(
          "h-full transition-shadow hover:shadow-md",
          featured && "ring-2 ring-primary/20",
        )}
      >
        <CardHeader className="flex flex-row items-start gap-3">
          <GameIcon
            id={game.icon}
            className="size-12 shrink-0 rounded-lg"
            title={game.title}
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="group-hover:underline">{game.title}</CardTitle>
              <Badge variant={isAvailable ? "default" : "outline"}>
                {isAvailable ? "Play" : "Coming soon"}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {game.description}
            </CardDescription>
          </div>
        </CardHeader>
        {meta ? (
          <CardFooter className="border-0 bg-transparent pt-0">
            <p className="text-xs text-muted-foreground">{meta}</p>
          </CardFooter>
        ) : null}
      </Card>
    </Link>
  )
}
