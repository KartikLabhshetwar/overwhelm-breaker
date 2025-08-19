import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chunks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { scheduledStart, scheduledEnd } = body
    const chunkId = params.id

    await db
      .update(chunks)
      .set({
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
      })
      .where(eq(chunks.id, chunkId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error scheduling chunk:", error)
    return NextResponse.json({ error: "Failed to schedule chunk" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chunkId = params.id

    await db
      .update(chunks)
      .set({
        scheduledStart: null,
        scheduledEnd: null,
      })
      .where(eq(chunks.id, chunkId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unscheduling chunk:", error)
    return NextResponse.json({ error: "Failed to unschedule chunk" }, { status: 500 })
  }
}
