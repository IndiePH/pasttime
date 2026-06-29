"use client"

import { useEffect, useRef } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface GameDailyRolloverBannerProps {
  onNewPuzzle: () => void
  onDismiss: () => void
  autoDismissMs?: number
}

/**
 * A non-destructive banner that appears when the daily puzzle has refreshed
 * (midnight UTC rollover). Prompts the player to start the new puzzle or keep
 * their current progress. Auto-dismisses after `autoDismissMs` (default 10s).
 */
export function GameDailyRolloverBanner({
  onNewPuzzle,
  onDismiss,
  autoDismissMs = 10_000,
}: GameDailyRolloverBannerProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, autoDismissMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onDismiss, autoDismissMs])

  return (
    <Alert variant="default" className="relative">
      <AlertTitle>Daily puzzle refreshed</AlertTitle>
      <AlertDescription>
        The daily puzzle has updated. Start the new puzzle or keep your current
        progress.
      </AlertDescription>
      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" onClick={onNewPuzzle}>
          New Puzzle
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDismiss}
        >
          Keep current
        </Button>
      </div>
    </Alert>
  )
}
