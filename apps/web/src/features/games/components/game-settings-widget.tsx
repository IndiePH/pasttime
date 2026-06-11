"use client"

import * as React from "react"
import { Settings2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GameSettingsWidgetProps {
  className?: string
  /** Extra classes for the dropdown panel (e.g. wider layout for long options). */
  panelClassName?: string
  /** Unique id for aria-controls (use game id). */
  panelId: string
  description: string
  /** Shown on the trigger after “Settings ·”. Omit when nothing is configured. */
  summary?: string
  children: React.ReactNode
  /** Called when Apply is pressed. Omit to hide the Apply button. */
  onApply?: () => void
  applyDisabled?: boolean
  /** Sync draft state when the panel opens. */
  onOpen?: () => void
  /** Reset draft state when the panel closes without applying. */
  onDismiss?: () => void
}

export function GameSettingsWidget({
  className,
  panelClassName,
  panelId,
  description,
  summary,
  children,
  onApply,
  applyDisabled = false,
  onOpen,
  onDismiss,
}: GameSettingsWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const titleId = `${panelId}-title`

  const handleDismiss = React.useCallback(() => {
    onDismiss?.()
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [onDismiss])

  const handleOpen = React.useCallback(() => {
    onOpen?.()
    setIsOpen(true)
  }, [onOpen])

  const handleApply = React.useCallback(() => {
    onApply?.()
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [onApply])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleDismiss()
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      handleDismiss()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [handleDismiss, isOpen])

  return (
    <div
      className={cn(
        "relative z-10 flex flex-col items-center",
        className,
      )}
    >
      {isOpen ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          aria-modal="false"
          className={cn(
            "absolute top-full left-1/2 z-20 mt-3 w-[min(100vw-2rem,20rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-border/80 bg-card p-4 text-left shadow-lg",
            panelClassName,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id={titleId}
                className="text-sm font-semibold tracking-tight"
              >
                Settings
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Close settings without saving"
              onClick={handleDismiss}
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 w-full min-w-0">{children}</div>
          {onApply ? (
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                disabled={applyDisabled}
              >
                Apply
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={isOpen ? handleDismiss : handleOpen}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
          isOpen && "invisible",
        )}
        tabIndex={isOpen ? -1 : 0}
        aria-hidden={isOpen}
      >
        <Settings2 className="size-4" strokeWidth={1.75} />
        <span>Settings</span>
        {summary ? (
          <>
            <span className="text-xs text-muted-foreground/80" aria-hidden>
              ·
            </span>
            <span className="text-xs text-muted-foreground/90">
              {summary}
            </span>
          </>
        ) : null}
      </button>
    </div>
  )
}
