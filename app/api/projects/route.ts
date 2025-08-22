import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { projects, tasks, chunks, users } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user ID
    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = user[0].id

    // Get projects with aggregated stats
    const projectsWithStats = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        totalTasks: sql<number>`count(distinct ${tasks.id})`.as("totalTasks"),
        completedTasks: sql<number>`count(distinct case when ${tasks.status} = 'done' then ${tasks.id} end)`.as(
          "completedTasks",
        ),
        totalChunks: sql<number>`count(distinct ${chunks.id})`.as("totalChunks"),
        completedChunks: sql<number>`count(distinct case when ${chunks.status} = 'done' then ${chunks.id} end)`.as(
          "completedChunks",
        ),
        estimatedHours: sql<number>`coalesce(sum(distinct ${chunks.durationMin}) / 60.0, 0)`.as("estimatedHours"),
      })
      .from(projects)
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .leftJoin(chunks, eq(tasks.id, chunks.taskId))
      .where(eq(projects.userId, userId))
      .groupBy(
        projects.id,
        projects.title,
        projects.description,
        projects.status,
        projects.createdAt,
        projects.updatedAt,
      )
      .orderBy(sql`${projects.updatedAt} desc`)

    return NextResponse.json({
      projects: projectsWithStats,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
