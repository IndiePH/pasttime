"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GamePostSolveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
}

export function GamePostSolveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: GamePostSolveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,36rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children ? <div className="space-y-5 py-1">{children}</div> : null}
        <DialogFooter className="sm:justify-center">
          {footer ?? (
            <GamePostSolveActionStack>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </GamePostSolveActionStack>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ViewResultsLinkProps {
  visible: boolean
  onClick: () => void
}

/** Matches {@link gamePlayFooterActionsClassName} button column width. */
export function GamePostSolveActionStack({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-60 flex-col gap-2">{children}</div>
  )
}

export function ViewResultsLink({ visible, onClick }: ViewResultsLinkProps) {
  if (!visible) return null

  return (
    <Button
      type="button"
      variant="link"
      className="h-auto min-h-9 px-0 text-sm"
      onClick={onClick}
    >
      View results
    </Button>
  )
}
