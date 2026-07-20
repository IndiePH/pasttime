# AdSense manual units
updated: 2026-07-20
tags: [monetization, adsense, devops, cloudflare]
related: [engineering-decisions]

Pasttime uses **manual Google AdSense display units** only (no Auto ads). Desktop-first; mobile unit IDs later.

## Domains (keep both)

| Host | Role |
|------|------|
| `pasttime.xyz` | **AdSense Sites** listing (apex required). Worker custom domain on `gamehub`. Must stay live for review/ads.txt. |
| `gamehub.pasttime.xyz` | Same Worker/app; product subdomain alias. |

**Critical distinction:** Cloudflare **DNS zone** ≠ Worker **Custom Domain**. Apex must be added on Worker `gamehub` → Settings → Domains & Routes → Custom Domain, or `https://pasttime.xyz` won’t serve the app/`ads.txt`. AdSense rejects subdomain-only site URLs (“must be a valid top-level domain”).

Do not detach `pasttime.xyz` from the Worker while site review is pending (often **2–4 weeks**).

## Placements

| Logical slot | AdSense unit name | Env var | Reserved size |
|--------------|-------------------|---------|---------------|
| `global-top-strip` | `pasttime-global-top-strip` | `NEXT_PUBLIC_ADSENSE_SLOT_TOP` | 728×90 |
| `global-bottom-strip` | `pasttime-global-bottom-strip` | `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM` | 728×90 |
| `hub-grid-card` | `pasttime-hub-grid-card` | `NEXT_PUBLIC_ADSENSE_SLOT_HUB` | card / ~300×250 |

Plus publisher: `NEXT_PUBLIC_ADSENSE_CLIENT`.

- AdSense UI often shows **`pub-…` only** — env / `data-ad-client` use **`ca-pub-…`** (same digits; add `ca-`). Code also accepts bare `pub-…` via `normalizeAdsenseClient`.
- Unit **names** are AdSense labels only. Env needs the **numeric ad unit ID** (`data-ad-slot`), not the name string.
- `NEXT_PUBLIC_*` is inlined at **Next build** time — change values → **redeploy**.
- Unset client/slots → dashed placeholders. Removed: `static-below-header`. No side rails.

Prefer **Responsive** AdSense units (better fill than fixed); our CSS still reserves desktop sizes.

## Where config lives (do not put secrets here)

| Kind | Names | Store | Survives `wrangler deploy`? |
|------|-------|--------|------------------------------|
| Public AdSense | `NEXT_PUBLIC_ADSENSE_CLIENT`, `_SLOT_*` | `vars` in `apps/web/wrangler.jsonc` (source of truth). Local: `.env.local` (gitignored). | Yes, if in `wrangler.jsonc` |
| Feedback / Resend | `RESEND_API_KEY`, `FEEDBACK_TO_EMAIL`, `FEEDBACK_FROM_EMAIL` | Worker **Secrets** only; `secrets.required` in wrangler. Local: `.env.local`. | Yes (secrets never wiped) |

**Never** commit Resend API keys or put them in `vars` / docs / wiki. Dashboard plaintext Variables alone are wiped on every deploy unless listed in `vars` or `keep_vars` is set.

Numeric publisher/slot IDs are public (they appear in page HTML and `ads.txt`) — production values live in `wrangler.jsonc` `vars`. Do not paste secret values into brain pages.

## Verification stack

| Method | Status |
|--------|--------|
| `/ads.txt` | Route serves `google.com, pub-…, DIRECT, f08c47fec0942fa0` when client set. Must work on **apex**. |
| AdSense `<script>` | `AdSenseScript` in root layout (env-gated). |
| Meta `google-adsense-account` | Not implemented; optional if ads.txt already verifies. |

Code: `apps/web/src/lib/adsense.ts`, `AdPanel`, `AdSenseScript`, `app/ads.txt/route.ts`. Spec/plan: `docs/superpowers/*adsense*`. Deploy notes: `docs/DEPLOY.md`.

## Consent (EEA / UK / CH)

Google requires a **certified CMP** for personalized ads in EEA/UK/CH. Choice for Pasttime: **Google’s CMP**, **3 choices** (Consent / Do not consent / Manage options) — not a third-party CMP yet. See [AdSense CMP requirements](https://support.google.com/adsense/answer/13554116).

## Site review / Publisher Policies

Google Publisher Policies ([support article](https://support.google.com/adsense/answer/10502938)) require a real privacy policy that discloses AdSense-related data use (cookies / web beacons / IP, third parties placing cookies) and preferably links [How Google uses data](https://policies.google.com/technologies/partner-sites).

Pasttime legal pages (`/privacy`, `/about`, `/terms`) must stay **substantive** — not placeholders. Placeholders were a likely review failure mode (privacy disclosures + thin inventory signals). After content fixes: redeploy apex, then request another review in AdSense Sites.

## Operator checklist

1. AdSense units named as above; copy **numeric** IDs into `.env.local` + `wrangler.jsonc` `vars` (not unit name strings).
2. Publisher: set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-…` even if Account info shows `pub-…`.
3. Resend/feedback: `wrangler versions secret put <NAME>` (or dashboard Secret), then deploy that version if needed — never plaintext.
4. Redeploy web (`npm run deploy` from repo / `apps/web`) so Next build bakes `NEXT_PUBLIC_*`.
5. Confirm `https://pasttime.xyz/ads.txt` (and gamehub) shows the `google.com, pub-…, DIRECT, …` line — not `# AdSense not configured`.
6. Confirm `/privacy` discloses AdSense + Google partner-sites link; `/about` and `/terms` are real copy.
7. AdSense Sites = apex; submit/wait Ready (ads may stay empty until then).
8. Keep Google CMP consent message published for future sites.
