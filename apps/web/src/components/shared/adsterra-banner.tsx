"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"

const OPT_OUT_KEY = "pasttime.ads.opt-out"
const LOAD_TIMEOUT_MS = 8000
const FRAME_WAIT_MS = 4000
const RETRY_DELAY_MS = 1500
const MAX_ATTEMPTS = 2

export const ADSTERRA_UNITS = {
  leaderboard: {
    key: "ba89e6165c8e6407fefa66e6d7ce8da3",
    width: 728,
    height: 90,
  },
  mobile: {
    key: "a7ae808a6285e94666833c6e992180b2",
    width: 320,
    height: 50,
  },
  skyscraper: {
    key: "38a789507575c03b2fae7ac17f1d13be",
    width: 160,
    height: 600,
  },
} as const

export type AdsterraUnitName = keyof typeof ADSTERRA_UNITS

type AtOptions = {
  key: string
  format: "iframe"
  height: number
  width: number
  params: Record<string, never>
}

function adsAllowed(): boolean {
  if (window.localStorage.getItem(OPT_OUT_KEY) === "1") return false
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.globalPrivacyControl !== true
}

function subscribeAdsPreference(): () => void {
  return () => {}
}

function waitForAdFrame(
  container: HTMLElement,
  cancelled: () => boolean,
): Promise<boolean> {
  if (container.querySelector("iframe")) return Promise.resolve(true)

  return new Promise((resolve) => {
    let settled = false
    let timer = 0
    const observer = new MutationObserver(() => {
      if (container.querySelector("iframe")) finish(true)
    })
    const finish = (filled: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      observer.disconnect()
      resolve(filled && !cancelled())
    }

    observer.observe(container, { childList: true, subtree: true })
    timer = window.setTimeout(() => finish(false), FRAME_WAIT_MS)
    if (cancelled()) finish(false)
  })
}

function delay(ms: number, cancelled: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms)
    if (cancelled()) {
      window.clearTimeout(timer)
      resolve()
    }
  })
}

function mountAttempt(
  container: HTMLElement,
  unit: (typeof ADSTERRA_UNITS)[AdsterraUnitName],
  cancelled: () => boolean,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (cancelled() || !container.isConnected || !adsAllowed()) {
      resolve(false)
      return
    }

    const options: AtOptions = {
      key: unit.key,
      format: "iframe",
      height: unit.height,
      width: unit.width,
      params: {},
    }
    ;(window as Window & { atOptions?: AtOptions }).atOptions = options

    const script = document.createElement("script")
    script.src = `https://bauval.org/22/${unit.key}`
    script.async = false

    let settled = false
    let timer = 0
    const finish = (filled: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve(filled && !cancelled())
    }

    script.onload = () => {
      void waitForAdFrame(container, cancelled).then(finish)
    }
    script.onerror = () => finish(false)
    timer = window.setTimeout(() => finish(false), LOAD_TIMEOUT_MS)
    container.replaceChildren(script)
  })
}

/**
 * The loader reads `window.atOptions` as it runs, then deletes it.
 * Mount one unit at a time so a second banner cannot replace the first key.
 * A failed or empty load gets one bounded retry; loaded ads are never refreshed.
 */
let mountQueue = Promise.resolve()

function mountUnit(
  container: HTMLElement,
  unit: (typeof ADSTERRA_UNITS)[AdsterraUnitName],
  cancelled: () => boolean,
): Promise<void> {
  const run = mountQueue.then(async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      if (attempt > 0) await delay(RETRY_DELAY_MS, cancelled)
      if (cancelled() || !container.isConnected) return
      if (await mountAttempt(container, unit, cancelled)) return
    }
  })
  mountQueue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export function useAdsAllowed(): boolean | null {
  return useSyncExternalStore(subscribeAdsPreference, adsAllowed, () => null)
}

export function AdsterraBanner({ unit }: { unit: AdsterraUnitName }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const spec = ADSTERRA_UNITS[unit]

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false
    void mountUnit(container, spec, () => cancelled)
    return () => {
      cancelled = true
      container.replaceChildren()
    }
  }, [spec])

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden leading-none"
      style={{ width: spec.width, height: spec.height, maxWidth: "100%" }}
    />
  )
}

export function AdOptOutControl() {
  const optedOut = useSyncExternalStore(
    subscribeAdsPreference,
    () => window.localStorage.getItem(OPT_OUT_KEY) === "1",
    () => false,
  )

  if (optedOut) {
    return (
      <p>
        Website ad sharing is off for this browser.{" "}
        <button
          type="button"
          className="underline underline-offset-4 hover:text-foreground"
          onClick={() => {
            window.localStorage.removeItem(OPT_OUT_KEY)
            window.location.reload()
          }}
        >
          Allow Website Ads
        </button>
      </p>
    )
  }

  return (
    <p>
      <button
        type="button"
        className="underline underline-offset-4 hover:text-foreground"
        onClick={() => {
          window.localStorage.setItem(OPT_OUT_KEY, "1")
          window.location.reload()
        }}
      >
        Do Not Sell My Personal Information
      </button>
    </p>
  )
}
