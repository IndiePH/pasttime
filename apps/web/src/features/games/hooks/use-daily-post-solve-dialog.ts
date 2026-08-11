"use client"

import * as React from "react"

/**
 * Auto-opens a post-solve dialog once when `active` becomes true (e.g. daily
 * win/loss). Supports re-open via setOpen after dismiss.
 */
export function useDailyPostSolveDialog(active: boolean) {
  const [open, setOpen] = React.useState(false)
  const autoOpenedRef = React.useRef(false)

  React.useEffect(() => {
    if (active && !autoOpenedRef.current) {
      autoOpenedRef.current = true
      setOpen(true)
    }
  }, [active])

  return {
    open,
    setOpen,
    canReview: active,
  }
}
