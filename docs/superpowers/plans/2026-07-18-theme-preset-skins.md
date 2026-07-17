# Theme Preset Skins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a preset-registry theme system with Default + full RetroUI light/dark skins, keeping System as a family-aware mode preference.

**Architecture:** Theme presets (`id` + `family` + `mode`) drive `data-theme` on `<html>` while `light`/`dark` classes preserve existing dark-variant CSS. Preference `{ family, mode }` persists in `localStorage`; Skin and Mode toggles in the header.

**Tech Stack:** Next.js App Router, existing ThemeProvider pattern, Tailwind v4 CSS variables, `next/font/google`

## Global Constraints

- Do not install RetroUI component registry in this pass
- Migrate legacy `theme` key; default family must match current zinc look
- No commits unless user requests

## File map

| File | Role |
|------|------|
| `apps/web/src/lib/theme/presets.ts` | Registry + resolve helpers |
| `apps/web/src/components/theme-provider.tsx` | Preference state, apply, migrate |
| `apps/web/src/app/layout.tsx` | Fonts + FOUC script |
| `apps/web/src/app/globals.css` | Default + retro token blocks / shadows |
| `apps/web/src/components/shared/mode-toggle.tsx` | Mode UI filtered by family |
| `apps/web/src/components/shared/skin-toggle.tsx` | Family/skin UI |
| `apps/web/src/components/shared/header.tsx` | Mount SkinToggle |
| `apps/web/src/lib/theme/presets.test.ts` | Resolve + migrate tests |

---

### Task 1: Preset registry + resolve helpers

**Files:**
- Create: `apps/web/src/lib/theme/presets.ts`
- Test: `apps/web/src/lib/theme/presets.test.ts`

**Interfaces:**
- Produces: `THEME_PRESETS`, `THEME_FAMILIES`, `resolvePreset(pref, systemMode)`, `modesForFamily(family)`, `migrateLegacyTheme(raw)`, types

- [ ] **Step 1:** Write tests for resolve (system + single-mode family fallback) and legacy migration
- [ ] **Step 2:** Implement registry and helpers
- [ ] **Step 3:** Run `npm run test --workspace=@pasttime/web -- presets` (or vitest path) — expect PASS

### Task 2: ThemeProvider refactor

**Files:**
- Modify: `apps/web/src/components/theme-provider.tsx`
- Modify: `apps/web/src/app/layout.tsx` (FOUC script)

**Interfaces:**
- Consumes: presets helpers
- Produces: `useTheme()` → `{ preference, setFamily, setMode, resolvedPreset, resolvedMode, families, modesForCurrentFamily }`

- [ ] **Step 1:** Refactor provider to store `ThemePreference`, apply `data-theme` + class + colorScheme
- [ ] **Step 2:** Update FOUC inline script to same resolve rules + migrate legacy key
- [ ] **Step 3:** Smoke: load app, toggle works without flash

### Task 3: Retro CSS + fonts

**Files:**
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1:** Load `Archivo_Black` (`--font-retro-head`) and `Space_Grotesk` (`--font-retro-sans`)
- [ ] **Step 2:** Add `[data-theme="retro-light"]` / `[data-theme="retro-dark"]` token blocks from RetroUI docs; remap fonts; hard shadows + radius 0; keep default zinc on `:root`/`.dark` and default-light/dark data-themes
- [ ] **Step 3:** Visual check Default vs Retro light/dark

### Task 4: Skin + Mode UI

**Files:**
- Create: `apps/web/src/components/shared/skin-toggle.tsx`
- Modify: `apps/web/src/components/shared/mode-toggle.tsx`
- Modify: `apps/web/src/components/shared/header.tsx`
- Modify: `apps/web/src/components/shared/index.ts`

- [ ] **Step 1:** SkinToggle for families
- [ ] **Step 2:** ModeToggle uses `modesForCurrentFamily` + System
- [ ] **Step 3:** Wire both into header

### Task 5: Verify

- [ ] **Step 1:** `npm run typecheck` / relevant web tests
- [ ] **Step 2:** Manual: Default light/dark/system; Retro light/dark/system; refresh persistence
