import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chunks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chunkId = params.id
    const chunk = await db.select().from(chunks).where(eq(chunks.id, chunkId)).limit(1)

    if (chunk.length === 0) {
      return NextResponse.json({ error: "Chunk not found" }, { status: 404 })
    }

    return NextResponse.json(chunk[0])
  } catch (error) {
    console.error("Error fetching chunk:", error)
    return NextResponse.json({ error: "Failed to fetch chunk" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body
    const chunkId = params.id

    await db
      .update(chunks)
      .set({ status: status as "todo" | "doing" | "done" | "snoozed" | "stuck" })
      .where(eq(chunks.id, chunkId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating chunk:", error)
    return NextResponse.json({ error: "Failed to update chunk" }, { status: 500 })
  }
}
