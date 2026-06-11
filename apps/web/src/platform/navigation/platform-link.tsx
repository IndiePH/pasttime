"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

export type PlatformLinkProps = ComponentProps<typeof Link>

export function PlatformLink(props: PlatformLinkProps) {
  return <Link {...props} />
}
