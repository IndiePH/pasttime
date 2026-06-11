"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function usePlatformRouter() {
  const router = useRouter()

  const push = useCallback(
    (href: string) => {
      router.push(href)
    },
    [router],
  )

  const replace = useCallback(
    (href: string) => {
      router.replace(href)
    },
    [router],
  )

  return { push, replace, back: router.back }
}
