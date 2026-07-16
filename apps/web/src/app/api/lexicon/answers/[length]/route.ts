import { NextResponse } from "next/server"

import { fetchLexiconAnswers } from "@/lib/lexicon/server"

type RouteContext = { params: Promise<{ length: string }> }

function parseLength(raw: string): number | null {
  const length = Number(raw)
  if (!Number.isInteger(length) || length < 5 || length > 10) {
    return null
  }
  return length
}

export async function GET(_request: Request, context: RouteContext) {
  const { length: rawLength } = await context.params
  const length = parseLength(rawLength)
  if (length === null) {
    return NextResponse.json({ error: "Invalid length" }, { status: 400 })
  }

  try {
    const words = await fetchLexiconAnswers(length)
    return NextResponse.json(
      { words },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, immutable",
        },
      },
    )
  } catch (error) {
    console.error("lexicon answers fetch failed", error)
    return NextResponse.json({ error: "Failed to load lexicon" }, { status: 500 })
  }
}
