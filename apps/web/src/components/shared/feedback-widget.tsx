"use client"

import * as React from "react"
import { MessageSquare, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FEEDBACK_CATEGORIES = [
  { id: "bug", label: "Bug Report" },
  { id: "feature", label: "Feature Request" },
  { id: "general", label: "General Feedback" },
  { id: "ui", label: "UI / Design Issue" },
] as const

type FeedbackCategoryId = (typeof FEEDBACK_CATEGORIES)[number]["id"]

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [category, setCategory] =
    React.useState<FeedbackCategoryId>("general")
  const [message, setMessage] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const resetForm = React.useCallback(() => {
    setCategory("general")
    setMessage("")
    setEmail("")
    setIsSubmitted(false)
    setIsSubmitting(false)
    setSubmitError(null)
  }, [])

  const handleClose = React.useCallback(() => {
    setIsOpen(false)
    resetForm()
    triggerRef.current?.focus()
  }, [resetForm])

  const handleOpen = React.useCallback(() => {
    setIsOpen(true)
    setIsSubmitted(false)
    setSubmitError(null)
  }, [])

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!message.trim() || isSubmitting) {
        return
      }

      setIsSubmitting(true)
      setSubmitError(null)

      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            message: message.trim(),
            email: email.trim() || undefined,
          }),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null
          setSubmitError(
            payload?.error ?? "Something went wrong. Please try again.",
          )
          return
        }

        setIsSubmitted(true)
      } catch {
        setSubmitError("Network error. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [category, email, isSubmitting, message],
  )

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose()
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
      handleClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [handleClose, isOpen])

  return (
    <div className="relative z-10 flex flex-col items-end">
      {isOpen ? (
        <div
          ref={panelRef}
          id="feedback-panel"
          role="dialog"
          aria-labelledby="feedback-dialog-title"
          aria-modal="false"
          className="absolute right-0 bottom-full mb-3 w-[min(100vw-2rem,20rem)] rounded-xl border border-border/80 bg-card p-4 shadow-lg sm:w-80"
        >
          <div className="flex items-start justify-between gap-3">
            <h2
              id="feedback-dialog-title"
              className="text-sm font-semibold tracking-tight"
            >
              Send Feedback
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close feedback"
              onClick={handleClose}
            >
              <X className="size-3.5" />
            </Button>
          </div>

          {isSubmitted ? (
            <div className="mt-4 space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Thanks for your feedback. We&apos;ll review it soon.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <fieldset>
                <legend className="sr-only">Feedback category</legend>
                <div className="grid grid-cols-2 gap-2">
                  {FEEDBACK_CATEGORIES.map((item) => {
                    const isSelected = category === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setCategory(item.id)}
                        className={cn(
                          "rounded-lg border px-2.5 py-2 text-left text-xs leading-snug transition-colors",
                          isSelected
                            ? "border-foreground/70 bg-muted/60 text-foreground"
                            : "border-border bg-background/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="space-y-3">
                <label className="sr-only" htmlFor="feedback-message">
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  name="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what's on your mind..."
                  className="w-full resize-none rounded-lg border border-border bg-background/80 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                />

                <label className="sr-only" htmlFor="feedback-email">
                  Email
                </label>
                <input
                  id="feedback-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email (optional for follow-up)"
                  className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                />
              </div>

              {submitError ? (
                <p className="text-xs text-destructive" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  disabled={!message.trim() || isSubmitting}
                >
                  <Send className="size-3.5" />
                  {isSubmitting ? "Sending…" : "Submit Feedback"}
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="feedback-panel"
        onClick={isOpen ? handleClose : handleOpen}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
          isOpen && "invisible",
        )}
        tabIndex={isOpen ? -1 : 0}
        aria-hidden={isOpen}
      >
        <MessageSquare className="size-4" strokeWidth={1.75} />
        Feedback
      </button>
    </div>
  )
}
