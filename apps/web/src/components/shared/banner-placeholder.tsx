"use client"

import { useEffect, useState } from "react"

import {
  AdsterraBanner,
  useAdsAllowed,
  type AdsterraUnitName,
} from "@/components/shared/adsterra-banner"

type HeaderUnit = Extract<AdsterraUnitName, "leaderboard" | "mobile">

function useHeaderUnit(enabled: boolean): HeaderUnit | null {
  const [unit, setUnit] = useState<HeaderUnit | null>(null)

  useEffect(() => {
    if (!enabled) return
    const wide = window.matchMedia("(min-width: 768px)")
    const short = window.matchMedia("(max-height: 500px)")
    const update = () => {
      const next = short.matches ? null : wide.matches ? "leaderboard" : "mobile"
      setUnit((current) => (current === next ? current : next))
    }
    update()
    wide.addEventListener("change", update)
    short.addEventListener("change", update)
    return () => {
      wide.removeEventListener("change", update)
      short.removeEventListener("change", update)
    }
  }, [enabled])

  return enabled ? unit : null
}

/**
 * Banner under the site header. One slot for every page, including play.
 * Desktop is 728×90. A narrow screen uses 320×50. Short landscape hides it.
 */
export function BannerPlaceholder() {
  const allowed = useAdsAllowed()
  const unit = useHeaderUnit(allowed === true)
  if (allowed === false) return null

  return (
    <div className="px-4 pb-3 [@media(max-height:500px)]:hidden">
      <div className="mx-auto h-[50px] w-full max-w-[320px] overflow-hidden bg-muted md:h-[90px] md:max-w-[728px]">
        {unit ? <AdsterraBanner key={unit} unit={unit} /> : null}
      </div>
    </div>
  )
}
