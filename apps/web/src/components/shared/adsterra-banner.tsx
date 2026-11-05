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
        if (cancelled() || !container.isConnected || !adsAllowed()) {
          resolve()
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
        const finish = () => {
          if (settled) return
          settled = true
          resolve()
        }
        script.onload = finish
        script.onerror = finish
        window.setTimeout(finish, 8000)
        container.replaceChildren(script)
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
