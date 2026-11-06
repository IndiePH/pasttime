"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"

const OPT_OUT_KEY = "pasttime.ads.opt-out"

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

const AD_LOAD_TIMEOUT_MS = 8_000
const AD_RENDER_GRACE_MS = 1_500
const MAX_AD_ATTEMPTS = 2

function adsAllowed(): boolean {
  if (window.localStorage.getItem(OPT_OUT_KEY) === "1") return false
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.globalPrivacyControl !== true
}

function subscribeAdsPreference(): () => void {
  return () => {}
}

/**
 * The loader reads `window.atOptions` as it runs, then deletes it.
 * Mount one unit at a time so a second banner cannot replace the first key.
 */
let mountQueue = Promise.resolve()

function mountUnit(
  container: HTMLElement,
  unit: (typeof ADSTERRA_UNITS)[AdsterraUnitName],
  cancelled: () => boolean,
): Promise<void> {
  const run = mountQueue.then(
    () =>
      new Promise<void>((resolve) => {
        let attempt = 0
        let loadTimer: number | undefined
        let retryTimer: number | undefined
        let currentOptions: AtOptions | undefined

        const clearTimers = () => {
          if (loadTimer !== undefined) window.clearTimeout(loadTimer)
          if (retryTimer !== undefined) window.clearTimeout(retryTimer)
        }

        const finish = () => {
          clearTimers()
          const win = window as Window & { atOptions?: AtOptions }
          if (win.atOptions === currentOptions) delete win.atOptions
          resolve()
        }

        const mountAttempt = () => {
          if (cancelled() || !container.isConnected || !adsAllowed()) {
            finish()
            return
          }

          attempt += 1
          const options: AtOptions = {
            key: unit.key,
            format: "iframe",
            height: unit.height,
            width: unit.width,
            params: {},
          }
          currentOptions = options
          ;(window as Window & { atOptions?: AtOptions }).atOptions = options

          const script = document.createElement("script")
          script.src = `https://bauval.org/22/${unit.key}`
          script.async = false

          let attemptSettled = false
          const inspectResult = () => {
            if (attemptSettled) return
            attemptSettled = true
            if (loadTimer !== undefined) window.clearTimeout(loadTimer)

            const rendered = container.querySelector("iframe") !== null
            if (
              cancelled() ||
              !container.isConnected ||
              rendered ||
              attempt >= MAX_AD_ATTEMPTS
            ) {
              finish()
              return
            }

            retryTimer = window.setTimeout(() => {
              retryTimer = undefined
              if (container.querySelector("iframe") !== null) {
                finish()
                return
              }
              mountAttempt()
            }, AD_RENDER_GRACE_MS)
          }

          script.onload = inspectResult
          script.onerror = inspectResult
          loadTimer = window.setTimeout(inspectResult, AD_LOAD_TIMEOUT_MS)
          container.replaceChildren(script)
        }

        mountAttempt()
      }),
  )
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
