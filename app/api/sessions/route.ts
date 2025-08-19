import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sessions } from "@/lib/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chunkId } = body

    if (!chunkId) {
      return NextResponse.json({ error: "Chunk ID required" }, { status: 400 })
    }

    const sessionId = createId()

    await db.insert(sessions).values({
      id: sessionId,
      chunkId,
      startedAt: new Date(),
    })

    const newSession = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)

    return NextResponse.json(newSession[0])
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
