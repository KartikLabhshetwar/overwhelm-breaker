import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { checkins } from "@/lib/db/schema"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, tPlusMin, sentiment, blockerTag } = body

    if (!sessionId || tPlusMin === undefined || !sentiment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await db.insert(checkins).values({
      id: createId(),
      sessionId,
      tPlusMin,
      sentiment: sentiment as "good" | "neutral" | "stuck",
      blockerTag: blockerTag || null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating check-in:", error)
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 })
  }
}
