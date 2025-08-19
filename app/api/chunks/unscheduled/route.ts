import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chunks, tasks, projects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get all chunks with their task and project info
    const allChunks = await db
      .select({
        id: chunks.id,
        title: chunks.title,
        description: chunks.description,
        durationMin: chunks.durationMin,
        energy: chunks.energy,
        status: chunks.status,
        scheduledStart: chunks.scheduledStart,
        scheduledEnd: chunks.scheduledEnd,
        taskTitle: tasks.title,
        projectTitle: projects.title,
      })
      .from(chunks)
      .innerJoin(tasks, eq(chunks.taskId, tasks.id))
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(chunks.status, "todo"))

    const unscheduled = allChunks.filter((chunk) => !chunk.scheduledStart)
    const scheduled = allChunks.filter((chunk) => chunk.scheduledStart)

    return NextResponse.json({
      unscheduled,
      scheduled,
    })
  } catch (error) {
    console.error("Error fetching chunks:", error)
    return NextResponse.json({ error: "Failed to fetch chunks" }, { status: 500 })
  }
}
