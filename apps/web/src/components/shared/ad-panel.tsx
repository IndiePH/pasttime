"use client"

import { useEffect, useRef } from "react"
import { UsersIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import {
  getGameCardAdMatchClasses,
  type GameCardSize,
} from "@/components/shared/game-card"
import {
  getAdsenseClient,
  getAdsenseSlotId,
  isAdsenseConfigured,
} from "@/lib/adsense"
import { cn } from "@/lib/utils"

export type AdPanelVariant = "strip" | "box" | "card"

/** Desktop-first AdSense display sizes we reserve before live units. */
const DESKTOP_AD_SIZE = {
  strip: { label: "728×90", className: "h-[90px] w-[728px] max-w-full" },
  box: { label: "300×250", className: "h-[250px] w-[300px] max-w-full" },
  card: { label: "300×250" },
} as const

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

interface AdPanelProps {
  slot: string
  variant?: AdPanelVariant
  className?: string
  matchGameCardSize?: GameCardSize
}

function AdPanelContent({
  slot,
  sizeLabel,
}: {
  slot: string
  sizeLabel: string
}) {
  return (
    <>
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
        Ad placeholder
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {sizeLabel}
      </span>
      <span className="text-xs text-muted-foreground/80">{slot}</span>
    </>
  )
}

function AdSenseUnit({ slot }: { slot: string }) {
  const pushed = useRef(false)
  const client = getAdsenseClient()
  const slotId = getAdsenseSlotId(slot)

  useEffect(() => {
    if (!client || !slotId || pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense may throw if the script is blocked; keep the reserved box.
    }
  }, [client, slotId])

  if (!client || !slotId) return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", height: "100%" }}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

export function AdPanel({
  slot,
  variant = "strip",
  className,
  matchGameCardSize,
}: AdPanelProps) {
  const live = isAdsenseConfigured(slot)

  if (variant === "card") {
    if (matchGameCardSize) {
      const shell = getGameCardAdMatchClasses(matchGameCardSize)
      const { placeholder } = shell

      return (
        <aside
          aria-label={`Advertisement: ${slot}`}
          data-ad-slot={slot}
          data-ad-size={DESKTOP_AD_SIZE.card.label}
          className={cn(
            "block w-full rounded-lg outline-none",
            className,
          )}
        >
          <div className={shell.article}>
            {live ? (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-2">
                <AdSenseUnit slot={slot} />
              </div>
            ) : (
              <>
                <div className={shell.header} aria-hidden>
                  <div className={cn(shell.iconFrame, "invisible")} />
                  <h3 className={cn(shell.title, "invisible")}>
                    {placeholder.title}
                  </h3>
                </div>
                <div className={shell.body} aria-hidden>
                  <p className={cn(shell.description, "invisible")}>
                    {placeholder.description}
                  </p>
                  <div className={cn(shell.player, "invisible")}>
                    <UsersIcon className={shell.playerIcon} />
                    <span>{placeholder.playerCount}</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3 text-center">
                  <AdPanelContent
                    slot={slot}
                    sizeLabel={DESKTOP_AD_SIZE.card.label}
                  />
                </div>
              </>
            )}
          </div>
        </aside>
      )
    }

    return (
      <aside
        aria-label={`Advertisement: ${slot}`}
        data-ad-slot={slot}
        data-ad-size={DESKTOP_AD_SIZE.card.label}
        className={cn("block h-full", className)}
      >
        <Card
          size="sm"
          className="flex h-full min-h-[250px] flex-col items-center justify-center gap-1 border border-dashed border-border/80 bg-muted/40 text-center ring-0"
        >
          {live ? (
            <div className="flex h-full w-full items-center justify-center p-2">
              <AdSenseUnit slot={slot} />
            </div>
          ) : (
            <AdPanelContent
              slot={slot}
              sizeLabel={DESKTOP_AD_SIZE.card.label}
            />
          )}
        </Card>
      </aside>
    )
  }

  const size = DESKTOP_AD_SIZE[variant]

  return (
    <aside
      aria-label={`Advertisement: ${slot}`}
      data-ad-slot={slot}
      data-ad-size={size.label}
      className={cn(
        "mx-auto flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed border-border/80 bg-muted/40 px-4 text-center",
        size.className,
        live && "border-solid p-0",
        className,
      )}
    >
      {live ? (
        <AdSenseUnit slot={slot} />
      ) : (
        <AdPanelContent slot={slot} sizeLabel={size.label} />
      )}
    </aside>
  )
}
