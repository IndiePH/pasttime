import { NextResponse } from "next/server"

import { fetchTypeShieldWords } from "@/lib/lexicon/server"

export async function GET() {
  try {
    const words = await fetchTypeShieldWords()
    return NextResponse.json(
      { words },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, immutable",
        },
      },
    )
  } catch (error) {
    console.error("type shield lexicon fetch failed", error)
    return NextResponse.json({ error: "Failed to load lexicon" }, { status: 500 })
  }
}
