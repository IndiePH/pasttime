# AdSense Manual Units Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Google AdSense manual display units into the three desktop slots (top strip, bottom strip, hub card), gated by env so local/preview stays on placeholders until IDs are set.

**Architecture:** A small `adsense` config module maps logical slot keys to env slot IDs. Root layout loads the AdSense script when the publisher client is set. `AdPanel` renders a live responsive `<ins class="adsbygoogle">` (client push) when configured, otherwise the existing dashed placeholder. `/ads.txt` is served from a route using the publisher ID.

**Tech Stack:** Next.js App Router, `next/script`, Vitest + Testing Library, Cloudflare Worker env (`NEXT_PUBLIC_*`)

## Global Constraints

- Manual AdSense units only — no Auto ads, no side rails, no play-screen ads
- Slots: `global-top-strip`, `global-bottom-strip`, `hub-grid-card` only (`static-below-header` already removed)
- Desktop reserved sizes: strips 728×90; hub card matches game card / labeled 300×250
- Never hardcode `ca-pub-` or slot IDs in committed source; use env only
- When client or slot ID missing → placeholder; no AdSense script if client missing
- Publisher ID in UI may be `pub-…`; env and `data-ad-client` use `ca-pub-…`; `ads.txt` uses `pub-…`

## File map

| File | Responsibility |
|------|----------------|
| `apps/web/src/lib/adsense.ts` | Read env; normalize client; map slot → unit ID; `isAdsenseEnabled` |
| `apps/web/src/lib/adsense.test.ts` | Unit tests for mapping / normalization |
| `apps/web/src/components/shared/ad-panel.tsx` | Placeholder vs live unit; client push for adsbygoogle |
| `apps/web/src/components/shared/ad-panel.test.tsx` | Placeholder vs `ins` rendering |
| `apps/web/src/components/shared/adsense-script.tsx` | Conditional Script tag |
| `apps/web/src/app/layout.tsx` | Mount `AdSenseScript` |
| `apps/web/src/app/ads.txt/route.ts` | `GET` text/plain ads.txt |
| `apps/web/.env.example` | Document env vars |
| `docs/DEPLOY.md` | Note Cloudflare env + ads.txt |

---

### Task 1: AdSense config module + tests

**Files:**
- Create: `apps/web/src/lib/adsense.ts`
- Create: `apps/web/src/lib/adsense.test.ts`

**Interfaces:**
- Produces:
  - `AdSlotKey = "global-top-strip" | "global-bottom-strip" | "hub-grid-card"`
  - `normalizeAdsenseClient(raw: string | undefined): string | null` — trims; if starts with `pub-` prepend `ca-`; if starts with `ca-pub-` keep; else null if empty
  - `getAdsenseClient(): string | null`
  - `getAdsenseSlotId(slot: string): string | null` — only known keys; reads `NEXT_PUBLIC_ADSENSE_SLOT_TOP` / `_BOTTOM` / `_HUB`
  - `isAdsenseConfigured(slot: string): boolean` — client and slot id both non-null
  - `toAdsTxtPublisherId(client: string): string` — strip leading `ca-` so ads.txt gets `pub-…`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest"
import {
  normalizeAdsenseClient,
  getAdsenseSlotId,
  isAdsenseConfigured,
  toAdsTxtPublisherId,
} from "./adsense"

describe("normalizeAdsenseClient", () => {
  it("returns null for empty", () => {
    expect(normalizeAdsenseClient(undefined)).toBeNull()
    expect(normalizeAdsenseClient("  ")).toBeNull()
  })

  it("accepts ca-pub- and pub- forms", () => {
    expect(normalizeAdsenseClient("ca-pub-123")).toBe("ca-pub-123")
    expect(normalizeAdsenseClient("pub-123")).toBe("ca-pub-123")
  })
})

describe("getAdsenseSlotId / isAdsenseConfigured", () => {
  const env = process.env as Record<string, string | undefined>

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "ca-pub-999")
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_TOP", "111")
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM", "222")
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_HUB", "333")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("maps known slots", () => {
    expect(getAdsenseSlotId("global-top-strip")).toBe("111")
    expect(getAdsenseSlotId("global-bottom-strip")).toBe("222")
    expect(getAdsenseSlotId("hub-grid-card")).toBe("333")
    expect(getAdsenseSlotId("static-below-header")).toBeNull()
  })

  it("is configured only when client and slot exist", () => {
    expect(isAdsenseConfigured("global-top-strip")).toBe(true)
    env.NEXT_PUBLIC_ADSENSE_SLOT_TOP = undefined
    expect(isAdsenseConfigured("global-top-strip")).toBe(false)
  })
})

describe("toAdsTxtPublisherId", () => {
  it("strips ca- prefix", () => {
    expect(toAdsTxtPublisherId("ca-pub-123")).toBe("pub-123")
    expect(toAdsTxtPublisherId("pub-123")).toBe("pub-123")
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm run test -w @pasttime/web -- src/lib/adsense.test.ts`  
Expected: FAIL (module missing)

- [ ] **Step 3: Implement `adsense.ts`**

```ts
const SLOT_ENV: Record<string, string> = {
  "global-top-strip": "NEXT_PUBLIC_ADSENSE_SLOT_TOP",
  "global-bottom-strip": "NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM",
  "hub-grid-card": "NEXT_PUBLIC_ADSENSE_SLOT_HUB",
}

export type AdSlotKey = keyof typeof SLOT_ENV

export function normalizeAdsenseClient(
  raw: string | undefined,
): string | null {
  const value = raw?.trim()
  if (!value) return null
  if (value.startsWith("ca-pub-")) return value
  if (value.startsWith("pub-")) return `ca-${value}`
  return null
}

export function getAdsenseClient(): string | null {
  return normalizeAdsenseClient(process.env.NEXT_PUBLIC_ADSENSE_CLIENT)
}

export function getAdsenseSlotId(slot: string): string | null {
  const envKey = SLOT_ENV[slot]
  if (!envKey) return null
  const id = process.env[envKey]?.trim()
  return id || null
}

export function isAdsenseConfigured(slot: string): boolean {
  return getAdsenseClient() !== null && getAdsenseSlotId(slot) !== null
}

export function toAdsTxtPublisherId(client: string): string {
  return client.startsWith("ca-") ? client.slice(3) : client
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm run test -w @pasttime/web -- src/lib/adsense.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit** (only if user requested commits)

```bash
git add apps/web/src/lib/adsense.ts apps/web/src/lib/adsense.test.ts
git commit -m "feat(ads): add AdSense env config helpers"
```

---

### Task 2: Live `AdPanel` + tests

**Files:**
- Modify: `apps/web/src/components/shared/ad-panel.tsx`
- Create: `apps/web/src/components/shared/ad-panel.test.tsx`

**Interfaces:**
- Consumes: `getAdsenseClient`, `getAdsenseSlotId`, `isAdsenseConfigured` from `@/lib/adsense`
- Produces: same `AdPanel` export; when configured, client component path renders `<ins class="adsbygoogle">` and pushes once

- [ ] **Step 1: Write failing tests**

```tsx
import { render, screen } from "@testing-library/react"
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
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
  })
})
```

- [ ] **Step 2: Run test — expect FAIL on live branch**

Run: `npm run test -w @pasttime/web -- src/components/shared/ad-panel.test.tsx`

- [ ] **Step 3: Implement live path in `ad-panel.tsx`**

- Add `"use client"` at top (needed for `useEffect` push).
- Keep existing placeholder UI for unconfigured slots.
- When `isAdsenseConfigured(slot)`:
  - Outer `aside` keeps reserved size classes / card shell.
  - Inner: `<ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={…} data-ad-slot={…} data-ad-format="auto" data-full-width-responsive="true" />`
  - `useEffect` once: `(window.adsbygoogle = window.adsbygoogle || []).push({})`
  - Extend `Window` with optional `adsbygoogle?: unknown[]` (local declare).

Preserve current desktop size labels on placeholders; live units use the same outer dimensions.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit** (if requested)

---

### Task 3: Script + `ads.txt` + docs

**Files:**
- Create: `apps/web/src/components/shared/adsense-script.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/ads.txt/route.ts`
- Modify: `apps/web/.env.example`
- Modify: `docs/DEPLOY.md`

**Interfaces:**
- Consumes: `getAdsenseClient`, `toAdsTxtPublisherId`
- Produces: script in layout; `GET /ads.txt` → `google.com, pub-…, DIRECT, f08c47fec0942fa0`

- [ ] **Step 1: Add `AdSenseScript`**

```tsx
import Script from "next/script"
import { getAdsenseClient } from "@/lib/adsense"

export function AdSenseScript() {
  const client = getAdsenseClient()
  if (!client) return null
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
```

Mount inside `<body>` in `layout.tsx` (or `<head>`): `<AdSenseScript />`.

- [ ] **Step 2: Add `ads.txt` route**

```ts
import { getAdsenseClient, toAdsTxtPublisherId } from "@/lib/adsense"

export function GET() {
  const client = getAdsenseClient()
  if (!client) {
    return new Response("# AdSense not configured\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
  const pub = toAdsTxtPublisherId(client)
  const body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
```

- [ ] **Step 3: Update `.env.example`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws

# AdSense (optional; leave unset for placeholders)
# NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
# NEXT_PUBLIC_ADSENSE_SLOT_TOP=
# NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM=
# NEXT_PUBLIC_ADSENSE_SLOT_HUB=
```

- [ ] **Step 4: Document in `docs/DEPLOY.md`**

Short section: set the four `NEXT_PUBLIC_ADSENSE_*` vars on the `gamehub` Worker for production; verify `https://gamehub.pasttime.xyz/ads.txt` after deploy.

- [ ] **Step 5: Typecheck + tests**

Run: `npm run typecheck -w @pasttime/web` and `npm run test -w @pasttime/web -- src/lib/adsense.test.ts src/components/shared/ad-panel.test.tsx`  
Expected: PASS

- [ ] **Step 6: Commit** (if requested)

---

### Task 4: Operator handoff (no code)

- [ ] Create 3 Display (responsive) units in AdSense
- [ ] Set Cloudflare Worker env for `gamehub` with client + 3 slot IDs
- [ ] Deploy (`npm run deploy` from web / root per project scripts)
- [ ] Confirm `/ads.txt` on apex + gamehub; units may be blank until site approval
- [ ] Confirm `/privacy`, `/about`, `/terms` are substantive (Publisher Policies / privacy disclosures) before requesting review on `pasttime.xyz`

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Env-driven client + 3 slots | 1, 3 |
| Script once when client set | 3 |
| AdPanel live vs placeholder | 2 |
| ads.txt | 3 |
| No static-below-header | already done |
| Desktop sizes / placeholders | 2 (preserve) |
| Docs / .env.example | 3 |
| Operator creates units | 4 |
