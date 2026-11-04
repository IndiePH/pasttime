"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function TrafficBeacon() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname === "/traffic" || pathname.startsWith("/traffic/")) {
      return
    }

    void fetch("/api/traffic", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {})
  }, [pathname])

  return null
}
