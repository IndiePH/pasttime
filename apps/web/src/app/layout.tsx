import type { Metadata } from "next"
import {
  Archivo_Black,
  Geist,
  Geist_Mono,
  Roboto_Slab,
  Space_Grotesk,
} from "next/font/google"
import { cookies } from "next/headers"
import Script from "next/script"

import { NuqsAdapter } from "nuqs/adapters/next/app"

import "./globals.css"
import { AdSenseScript } from "@/components/shared/adsense-script"
import { ThemeProvider } from "@/components/theme-provider"
import { StorageProvider } from "@/infrastructure/storage"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  metadataBase: new URL("https://pasttime.xyz"),
  title: {
    default: "Pasttime",
    template: "%s — Pasttime",
  },
  description:
    "Free daily puzzles and classic games in the browser — Crossword, Word Guess, Sudoku, Solitaire, and more. No download required.",
}

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-game-title",
})

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-retro-head",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-retro-sans",
  display: "swap",
})

const STORAGE_KEY = "pasttime-theme"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get(STORAGE_KEY)?.value

  let initialThemeClass = ""
  if (themeCookie) {
    try {
      const pref: { family?: string; mode?: string } = JSON.parse(themeCookie)
      if (pref.mode === "dark") {
        initialThemeClass = "dark"
      }
      // "light" and "system" are the CSS default — no class needed
    } catch {
      /* ignore invalid cookie */
    }
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        initialThemeClass,
        fontMono.variable,
        robotoSlab.variable,
        archivoBlack.variable,
        spaceGrotesk.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <head />
      <body>
        <AdSenseScript />
        <ThemeProvider>
          <StorageProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </StorageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
