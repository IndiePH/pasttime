import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AdPanel } from "./ad-panel"

describe("AdPanel", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("shows placeholder when AdSense is not configured", () => {
    render(<AdPanel slot="global-top-strip" variant="strip" />)
    expect(screen.getByText(/ad placeholder/i)).toBeTruthy()
    expect(document.querySelector("ins.adsbygoogle")).toBeNull()
  })

  it("renders adsbygoogle ins when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "ca-pub-999")
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_TOP", "111")
    render(<AdPanel slot="global-top-strip" variant="strip" />)
    const ins = document.querySelector("ins.adsbygoogle")
    expect(ins).not.toBeNull()
    expect(ins?.getAttribute("data-ad-client")).toBe("ca-pub-999")
    expect(ins?.getAttribute("data-ad-slot")).toBe("111")
    expect(ins?.getAttribute("data-ad-format")).toBeNull()
    expect(ins?.getAttribute("data-full-width-responsive")).toBeNull()
    expect(ins).toHaveStyle({ width: "728px", height: "90px" })
  })

  it("keeps a sized card shell when the hub slot is live", () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "ca-pub-999")
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_HUB", "333")
    render(
      <AdPanel
        slot="hub-grid-card"
        variant="card"
        matchGameCardSize="compact"
      />,
    )

    expect(screen.getByText("Sample Quiz")).toBeTruthy()
    expect(document.querySelector("ins.adsbygoogle")).not.toBeNull()
    expect(screen.queryByText(/ad placeholder/i)).toBeNull()
  })
})
