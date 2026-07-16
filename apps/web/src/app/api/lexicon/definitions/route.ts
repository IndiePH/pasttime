import { NextResponse } from "next/server"

import { fetchWordDefinitions } from "@/lib/lexicon/server"

interface DefinitionsRequestBody {
  words?: string[]
}

export async function POST(request: Request) {
  let body: DefinitionsRequestBody
  try {
    body = (await request.json()) as DefinitionsRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const words = body.words ?? []
  if (!Array.isArray(words) || words.length === 0) {
    return NextResponse.json({ error: "words array required" }, { status: 400 })
  }
  if (words.length > 200) {
    return NextResponse.json({ error: "Too many words requested" }, { status: 400 })
  }

  try {
    const definitions = await fetchWordDefinitions(words)
    return NextResponse.json(
      { definitions },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      },
    )
  } catch (error) {
    console.error("lexicon definitions fetch failed", error)
    return NextResponse.json({ error: "Failed to load definitions" }, { status: 500 })
  }
}
