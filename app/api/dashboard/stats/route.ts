import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { projects, chunks, sessions } from "@/lib/db/schema"
import { eq, and, gte } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get current date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Count active projects
    const activeProjects = await db.select().from(projects).where(eq(projects.status, "active"))

    // Count today's scheduled chunks
    const todayChunks = await db
      .select()
      .from(chunks)
      .where(
        and(
          gte(chunks.scheduledStart, today),
          gte(new Date(today.getTime() + 24 * 60 * 60 * 1000), chunks.scheduledStart),
        ),
      )

    // Get week's focus time and completion rate
    const weekSessions = await db.select().from(sessions).where(gte(sessions.startedAt, weekAgo))

    const weekFocusTime = weekSessions.reduce((sum, session) => sum + (session.actualMin || 0), 0)
    const completedSessions = weekSessions.filter((session) => session.outcome === "done").length
    const completionRate = weekSessions.length > 0 ? (completedSessions / weekSessions.length) * 100 : 0

    return NextResponse.json({
      activeProjects: activeProjects.length,
      todayChunks: todayChunks.length,
      weekFocusTime,
      completionRate,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
