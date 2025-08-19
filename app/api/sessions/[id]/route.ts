import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { outcome, actualMin, reflection } = body
    const sessionId = params.id

    await db
      .update(sessions)
      .set({
        endedAt: new Date(),
        outcome: outcome as "done" | "stuck" | "snoozed",
        actualMin,
        reflection,
      })
      .where(eq(sessions.id, sessionId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}
