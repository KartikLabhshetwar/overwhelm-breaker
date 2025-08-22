import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { chunks, tasks, projects } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { scheduledStart, scheduledEnd } = body
    const chunkId = params.id

    const chunkOwnership = await db
      .select({ id: chunks.id })
      .from(chunks)
      .innerJoin(tasks, eq(chunks.taskId, tasks.id))
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(and(eq(chunks.id, chunkId), eq(projects.userId, session.user.id)))
      .limit(1)

    if (chunkOwnership.length === 0) {
      return NextResponse.json({ error: "Chunk not found or unauthorized" }, { status: 404 })
    }

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chunkId = params.id

    const chunkOwnership = await db
      .select({ id: chunks.id })
      .from(chunks)
      .innerJoin(tasks, eq(chunks.taskId, tasks.id))
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(and(eq(chunks.id, chunkId), eq(projects.userId, session.user.id)))
      .limit(1)

    if (chunkOwnership.length === 0) {
      return NextResponse.json({ error: "Chunk not found or unauthorized" }, { status: 404 })
    }

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
