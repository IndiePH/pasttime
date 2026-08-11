"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

interface GameShareCopyButtonProps {
  shareText: string
  className?: string
  variant?: "default" | "outline"
}

export function GameShareCopyButton({
  shareText,
  className,
  variant = "default",
}: GameShareCopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className ?? "w-full gap-2"}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="size-4" aria-hidden />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-4" aria-hidden />
          Copy result
        </>
      )}
    </Button>
  )
}

export function buildGameShareUrl(gameId: string): string | undefined {
  if (typeof window === "undefined") {
    return undefined
  }
  return `${window.location.origin}/games/${gameId}`
}
