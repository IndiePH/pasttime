# Theme Preset Skins Design

**Date:** 2026-07-18  
**Status:** Approved  
**Scope:** `apps/web` theme system + RetroUI full skin (light + dark)

## Goal

Add optional visual skins on top of Pasttime’s existing light/dark/system preference, starting with a full RetroUI (neobrutalist) skin, in a way that supports future skins that are light-only, dark-only, or both.

## Decisions

| Decision | Choice |
|----------|--------|
| Relationship to current zinc theme | Additional skin; default stays zinc |
| Retro depth | Full look: colors, Archivo Black + Space Grotesk, hard offset shadows, square radius |
| Architecture | Preset registry + family-aware System (not orthogonal skin×mode without capabilities) |
| System preference | Kept as a mode option within the current family |
| RetroUI components registry | Out of scope (tokens/fonts only) |
| Folding to flat theme list later | Easy: presets remain the atomic unit |

## Model

```ts
type ColorMode = "light" | "dark"
type ModePreference = ColorMode | "system"

type ThemePreset = {
  id: string           // e.g. "retro-light"
  family: string       // e.g. "retro"
  mode: ColorMode
  label: string
}

type ThemePreference = {
  family: string
  mode: ModePreference
}
```

### Initial registry

| id | family | mode | label |
|----|--------|------|-------|
| `default-light` | `default` | light | Default |
| `default-dark` | `default` | dark | Default |
| `retro-light` | `retro` | light | Retro |
| `retro-dark` | `retro` | dark | Retro |

A future light-only or dark-only family registers a single preset. Mode UI only lists modes that family supports. System resolves to the matching preset when available, otherwise the family’s only preset.

## Apply & persist

- On `<html>`:
  - `data-theme="<preset-id>"`
  - class `light` or `dark` from resolved mode (keeps `@custom-variant dark`)
  - `style.colorScheme`
- Storage key: `pasttime-theme` → JSON `ThemePreference`
- Migrate legacy `theme` values (`light` | `dark` | `system`) → `{ family: "default", mode: <value> }`
- Before-interactive FOUC script resolves preference → preset before paint

## CSS & fonts

- Keep current `:root` / `.dark` tokens as the **default** family (also addressable via `data-theme="default-light|default-dark"`).
- Add `[data-theme="retro-light"]` and `[data-theme="retro-dark"]` with RetroUI tokens from https://retroui.dev/docs/installation (including `--radius: 0`, hard `--shadow-*`, `--primary-hover`).
- Load Geist + Roboto Slab (default) and Space Grotesk + Archivo Black (retro). Retro presets remap `--font-sans` / `--font-heading` / `--font-game-title` to retro font CSS variables.

## UI

- Header **Mode** toggle: Light / Dark / System, filtered to modes supported by the current family.
- Header **Skin** toggle: Default | Retro (extensible list of families).
- Changing family keeps preferred mode when supported; otherwise snaps to the family’s only mode.

## Non-goals

- Installing RetroUI / shadcn registry components
- Additional skins beyond default + retro
- Per-game theme overrides

## Success criteria

- Default skin unchanged visually for existing users after migration
- Selecting Retro applies full neobrutalist light or dark look
- System still follows OS within the active family
- Adding a new skin later = registry entry + CSS block + family label
