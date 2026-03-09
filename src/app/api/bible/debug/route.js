import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.SCRIPTURE_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "SCRIPTURE_API_KEY not set in .env.local" })
  }

  // Step 1 — verify the key works by listing available Bibles
  try {
    const res  = await fetch("https://rest.api.bible/v1/bibles", {
      headers: { "api-key": apiKey }
    })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        status:  "FAILED",
        code:    res.status,
        message: data?.message || data?.error || "Unknown error",
        keyUsed: apiKey.slice(0, 6) + "..." + apiKey.slice(-4),
      })
    }

    // Find WEB and KJV Bible IDs from the returned list
    const bibles = data?.data || []
    const web    = bibles.find(b =>
      b.nameLocal?.toLowerCase().includes("world english") ||
      b.name?.toLowerCase().includes("world english")
    )
    const kjv    = bibles.find(b =>
      b.nameLocal?.toLowerCase().includes("king james") ||
      b.name?.toLowerCase().includes("king james")
    )

    return NextResponse.json({
      status:       "CONNECTED",
      totalBibles:  bibles.length,
      WEB_id:       web?.id   || "not found",
      WEB_name:     web?.name || "not found",
      KJV_id:       kjv?.id   || "not found",
      KJV_name:     kjv?.name || "not found",
      sampleBibles: bibles.slice(0, 8).map(b => ({ id: b.id, name: b.name })),
    })

  } catch (error) {
    return NextResponse.json({
      status:  "ERROR",
      message: error.message,
    })
  }
}