import { NextResponse } from "next/server"

import { fetchCrosswordAnswers } from "@/lib/lexicon/server"

export async function GET() {
  try {
    const words = await fetchCrosswordAnswers()
    return NextResponse.json(
      { words },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, immutable",
        },
      },
    )
  } catch (error) {
    console.error("crossword answers fetch failed", error)
    return NextResponse.json({ error: "Failed to load lexicon" }, { status: 500 })
  }
}
