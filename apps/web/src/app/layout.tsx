import type { Metadata } from "next"
import {
  Archivo_Black,
  Geist,
  Geist_Mono,
  Roboto_Slab,
  Space_Grotesk,
} from "next/font/google"
import Script from "next/script"

import { NuqsAdapter } from "nuqs/adapters/next/app"

import "./globals.css"
import { AdSenseScript } from "@/components/shared/adsense-script"
import { ThemeProvider } from "@/components/theme-provider"
import { StorageProvider } from "@/infrastructure/storage"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "Pasttime",
    template: "%s — Pasttime",
  },
  description: "Daily puzzles and games in one hub.",
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

const themeInitScript = `(function(){try{var KEY="pasttime-theme";var LEGACY="theme";var available={default:1};var raw=localStorage.getItem(KEY);if(!raw){var legacy=localStorage.getItem(LEGACY);if(legacy==="light"||legacy==="dark"||legacy==="system"){raw=JSON.stringify({family:"default",mode:legacy});try{localStorage.setItem(KEY,raw)}catch(e){}}else{raw=JSON.stringify({family:"default",mode:"system"})}}var pref;try{pref=JSON.parse(raw)}catch(e){pref={family:"default",mode:"system"}}var family=pref&&typeof pref.family==="string"?pref.family:"default";if(!available[family])family="default";var mode=pref&&(pref.mode==="light"||pref.mode==="dark"||pref.mode==="system")?pref.mode:"system";var system=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var desired=mode==="system"?system:mode;var id=family+"-"+desired;var known={"default-light":1,"default-dark":1};if(!known[id]){id="default-"+desired;if(!known[id])id="default-light";desired=id.endsWith("dark")?"dark":"light"}var root=document.documentElement;root.setAttribute("data-theme",id);root.classList.remove("light","dark");root.classList.add(desired);root.style.colorScheme=desired}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        robotoSlab.variable,
        archivoBlack.variable,
        spaceGrotesk.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <head>
        <Script id="pasttime-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
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
