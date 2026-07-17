"use client"

import * as React from "react"
import { ChevronDownIcon, PaletteIcon } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SkinToggle() {
  const { preference, setFamily, families, resolvedPreset } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  // Nothing to choose while only one skin is available.
  if (families.length <= 1) {
    return null
  }

  const currentFamily =
    families.find((family) => family.id === preference.family) ?? families[0]

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-1.5 px-2.5" disabled>
        <PaletteIcon className="size-4" />
        <span className="text-sm font-normal">Skin</span>
        <ChevronDownIcon className="size-3.5 opacity-60" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2.5"
          aria-label={`Skin: ${currentFamily?.label ?? resolvedPreset.label}`}
        >
          <PaletteIcon className="size-4" />
          <span className="text-sm font-normal">
            {currentFamily?.label ?? resolvedPreset.label}
          </span>
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={preference.family}
          onValueChange={setFamily}
        >
          {families.map((family) => (
            <DropdownMenuRadioItem key={family.id} value={family.id}>
              {family.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
