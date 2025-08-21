import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { projects, chunks, sessions } from "@/lib/db/schema"
import { eq, and, gte } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching dashboard stats...")

    // Get current date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    let activeProjects, todayChunks, weekSessions

    try {
      // Count active projects
      activeProjects = await db.select().from(projects).where(eq(projects.status, "active"))
    } catch (dbError: any) {
      if (dbError.message?.includes('relation "projects" does not exist')) {
        console.log("[v0] Database tables not found - returning default stats")
        return NextResponse.json({
          activeProjects: 0,
          todayChunks: 0,
          weekFocusTime: 0,
          completionRate: 0,
          message: "Database setup required - please run migration scripts",
        })
      }
      throw dbError
    }

    // Count today's scheduled chunks
    todayChunks = await db
      .select()
      .from(chunks)
      .where(
        and(
          gte(chunks.scheduledStart, today),
          gte(new Date(today.getTime() + 24 * 60 * 60 * 1000), chunks.scheduledStart),
        ),
      )

    // Get week's focus time and completion rate
    weekSessions = await db.select().from(sessions).where(gte(sessions.startedAt, weekAgo))

    const weekFocusTime = weekSessions.reduce((sum, session) => sum + (session.actualMin || 0), 0)
    const completedSessions = weekSessions.filter((session) => session.outcome === "done").length
    const completionRate = weekSessions.length > 0 ? (completedSessions / weekSessions.length) * 100 : 0

    console.log("[v0] Dashboard stats fetched successfully")
    return NextResponse.json({
      activeProjects: activeProjects.length,
      todayChunks: todayChunks.length,
      weekFocusTime,
      completionRate,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        activeProjects: 0,
        todayChunks: 0,
        weekFocusTime: 0,
        completionRate: 0,
      },
      { status: 500 },
    )
  }
}
