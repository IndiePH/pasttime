import { describe, expect, it } from "vitest"

import {
  DEFAULT_PREFERENCE,
  migrateLegacyTheme,
  modesForFamily,
  parseStoredPreference,
  resolveFromPresets,
  resolvePreset,
  type ThemePreset,
} from "./presets"

describe("theme presets", () => {
  it("lists modes for a family", () => {
    expect(modesForFamily("default")).toEqual(["light", "dark"])
    expect(modesForFamily("retro")).toEqual(["light", "dark"])
  })

  it("resolves system mode within the active family", () => {
    expect(
      resolvePreset({ family: "retro", mode: "system" }, "dark").id,
    ).toBe("retro-dark")
    expect(
      resolvePreset({ family: "default", mode: "system" }, "light").id,
    ).toBe("default-light")
  })

  it("falls back to default family when family is unknown", () => {
    expect(
      resolvePreset({ family: "missing", mode: "light" }, "dark").id,
    ).toBe("default-light")
  })

  it("falls back to the family's only preset when desired mode is missing", () => {
    const lightOnly: ThemePreset[] = [
      {
        id: "paper-light",
        family: "paper",
        mode: "light",
        label: "Paper",
      },
    ]
    expect(
      resolveFromPresets(
        lightOnly,
        { family: "paper", mode: "dark" },
        "dark",
      ).id,
    ).toBe("paper-light")
    expect(
      resolveFromPresets(
        lightOnly,
        { family: "paper", mode: "system" },
        "dark",
      ).id,
    ).toBe("paper-light")
  })

  it("migrates legacy theme strings", () => {
    expect(migrateLegacyTheme("dark")).toEqual({
      family: "default",
      mode: "dark",
    })
    expect(migrateLegacyTheme("system")).toEqual(DEFAULT_PREFERENCE)
    expect(migrateLegacyTheme("nope")).toEqual(DEFAULT_PREFERENCE)
  })

  it("parses JSON preference and legacy strings", () => {
    expect(parseStoredPreference("dark")).toEqual({
      family: "default",
      mode: "dark",
    })
    expect(parseStoredPreference(null)).toEqual(DEFAULT_PREFERENCE)
  })

  it("snaps unavailable families (e.g. hidden retro) back to default", () => {
    expect(
      parseStoredPreference(
        JSON.stringify({ family: "retro", mode: "light" }),
      ),
    ).toEqual({ family: "default", mode: "light" })
  })
})
