"use client"

import * as React from "react"
import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY_PREFIX = "pasttime.typing.handheld-notice"
const LEGACY_STORAGE_KEY = STORAGE_KEY_PREFIX

type NoticePhase = "pending" | "open" | "closed"

const phases = new Map<string, NoticePhase>()
const loaded = new Set<string>()
const listeners = new Set<() => void>()

function storageKey(gameId: string): string {
  return `${STORAGE_KEY_PREFIX}.${gameId}`
}

function hydrate(gameId: string) {
  if (loaded.has(gameId) || typeof window === "undefined") {
    return
  }
  loaded.add(gameId)
  window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  phases.set(
    gameId,
    window.localStorage.getItem(storageKey(gameId)) === "hidden"
      ? "closed"
      : "open"
  )
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function phaseOf(gameId: string): NoticePhase {
  return phases.get(gameId) ?? "pending"
}

export function useTypingHandheldNotice(gameId: string): NoticePhase {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrate(gameId)
      return phaseOf(gameId)
    },
    () => "pending"
  )
}

export function dismissTypingHandheldNotice(gameId: string, permanent: boolean) {
  hydrate(gameId)
  phases.set(gameId, "closed")
  if (permanent) {
    window.localStorage.setItem(storageKey(gameId), "hidden")
  }
  emit()
}

export function resetTypingHandheldNotice() {
  phases.clear()
  loaded.clear()
  listeners.clear()
}

export function TypingHandheldNotice({ gameId }: { gameId: string }) {
  const noticePhase = useTypingHandheldNotice(gameId)
  const [dontShowAgain, setDontShowAgain] = React.useState(false)

  function dismiss() {
    dismissTypingHandheldNotice(gameId, dontShowAgain)
  }

  return (
    <Dialog
      open={noticePhase === "open"}
      onOpenChange={(open) => {
        if (!open) {
          dismiss()
        }
      }}
    >
      {/* 47ch of the zero glyph is about 60 average characters, inside the 45–75 reading measure. */}
      <DialogContent
        showCloseButton={false}
        className="text-sm sm:max-w-[calc(47ch+3rem)]"
      >
        <DialogHeader className="pr-0">
          <DialogTitle>Handheld Play</DialogTitle>
          <DialogDescription className="text-pretty">
            Typing games are harder on a handheld. An on-screen keyboard covers
            the screen and is slower than a physical keyboard.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col items-center gap-3">
          <Button type="button" onClick={dismiss}>
            Continue
          </Button>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="size-3.5 accent-primary"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
            />
            Don&apos;t Show Again
          </label>
        </div>
      </DialogContent>
    </Dialog>
  )
}
