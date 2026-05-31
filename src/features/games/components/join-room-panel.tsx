"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  gameRoomPath,
  isValidRoomCode,
  normalizeRoomCode,
} from "@/domain/games"

interface JoinRoomPanelProps {
  gameId: string
  onCancel: () => void
}

export function JoinRoomPanel({ gameId, onCancel }: JoinRoomPanelProps) {
  const router = useRouter()
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = normalizeRoomCode(event.target.value).replace(/[^A-Z0-9]/g, "")
    setCode(next.slice(0, 6))
    setError(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidRoomCode(code)) {
      setError("Enter a 6-character room code.")
      return
    }
    router.push(gameRoomPath(gameId, code))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 w-full rounded-xl border border-border/80 bg-card p-4 text-left shadow-sm"
    >
      <p className="text-sm font-medium">Join with room code</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ask the host for their 6-character code.
      </p>
      <label className="sr-only" htmlFor="room-code">
        Room code
      </label>
      <input
        ref={inputRef}
        id="room-code"
        name="room-code"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={code}
        onChange={handleCodeChange}
        placeholder="ABC123"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "room-code-error" : undefined}
        className="mt-3 w-full rounded-lg border border-border bg-background/80 px-3 py-2.5 text-center font-mono text-lg tracking-[0.3em] uppercase placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      />
      {error ? (
        <p id="room-code-error" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="submit" className="flex-1" disabled={code.length === 0}>
          Join room
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
