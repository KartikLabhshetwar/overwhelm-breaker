import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sessions, chunks, tasks, projects } from "@/lib/db/schema"
import { eq, gte } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "week"

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // All time
    }

    // Get all sessions with chunk, task, and project info
    const allSessions = await db
      .select({
        id: sessions.id,
        chunkId: sessions.chunkId,
        startedAt: sessions.startedAt,
        endedAt: sessions.endedAt,
        outcome: sessions.outcome,
        actualMin: sessions.actualMin,
        reflection: sessions.reflection,
        chunkTitle: chunks.title,
        chunkEnergy: chunks.energy,
        taskTitle: tasks.title,
        projectTitle: projects.title,
      })
      .from(sessions)
      .innerJoin(chunks, eq(sessions.chunkId, chunks.id))
      .innerJoin(tasks, eq(chunks.taskId, tasks.id))
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(gte(sessions.startedAt, startDate))

    // Calculate metrics
    const totalSessions = allSessions.length
    const totalFocusTime = allSessions.reduce((sum, session) => sum + (session.actualMin || 0), 0)
    const completedSessions = allSessions.filter((session) => session.outcome === "done").length
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
    const averageSessionLength = totalSessions > 0 ? totalFocusTime / totalSessions : 0

    // Energy distribution
    const energyDistribution = {
      high: allSessions.filter((session) => session.chunkEnergy === "high").length,
      med: allSessions.filter((session) => session.chunkEnergy === "med").length,
      low: allSessions.filter((session) => session.chunkEnergy === "low").length,
    }

    // Weekly progress (last 4 weeks)
    const weeklyProgress = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)

      const weekSessions = allSessions.filter(
        (session) => session.startedAt >= weekStart && session.startedAt < weekEnd,
      )

      weeklyProgress.push({
        week: `Week of ${weekStart.toLocaleDateString()}`,
        sessions: weekSessions.length,
        focusTime: weekSessions.reduce((sum, session) => sum + (session.actualMin || 0), 0),
        completions: weekSessions.filter((session) => session.outcome === "done").length,
      })
    }

    // Recent sessions (last 10)
    const recentSessions = allSessions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 10)
      .map((session) => ({
        id: session.id,
        chunkTitle: session.chunkTitle,
        projectTitle: session.projectTitle,
        startedAt: session.startedAt,
        outcome: session.outcome || "unknown",
        actualMin: session.actualMin || 0,
        reflection: session.reflection,
      }))

    // Generate insights
    const insights = generateInsights({
      totalSessions,
      completionRate,
      energyDistribution,
      averageSessionLength,
      allSessions,
    })

    return NextResponse.json({
      totalSessions,
      totalFocusTime,
      completionRate,
      averageSessionLength,
      energyDistribution,
      weeklyProgress,
      recentSessions,
      insights,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

function generateInsights(data: any): string[] {
  const insights: string[] = []

  // Completion rate insights
  if (data.completionRate >= 80) {
    insights.push("Excellent! You're completing most of your focus sessions. Keep up the great work!")
  } else if (data.completionRate >= 60) {
    insights.push("Good progress! Try to identify what's causing incomplete sessions and address those blockers.")
  } else if (data.completionRate < 60 && data.totalSessions > 5) {
    insights.push(
      "Consider breaking down your chunks into smaller, more manageable pieces to improve completion rates.",
    )
  }

  // Energy distribution insights
  const { high, med, low } = data.energyDistribution
  const total = high + med + low

  if (total > 0) {
    if (high / total > 0.5) {
      insights.push(
        "You're tackling a lot of high-energy tasks. Make sure to balance with some easier tasks to avoid burnout.",
      )
    } else if (low / total > 0.6) {
      insights.push(
        "You might be playing it too safe with low-energy tasks. Try scheduling some challenging work during your peak hours.",
      )
    } else {
      insights.push("Great energy balance! You're mixing challenging and routine tasks effectively.")
    }
  }

  // Session length insights
  if (data.averageSessionLength > 15) {
    insights.push(
      "Your sessions are running longer than planned. Consider setting stricter time boundaries or breaking chunks smaller.",
    )
  } else if (data.averageSessionLength < 8 && data.totalSessions > 3) {
    insights.push(
      "Your sessions are quite short. You might benefit from slightly longer chunks or reducing interruptions.",
    )
  }

  // Productivity patterns
  const morningSessions = data.allSessions.filter((session: any) => {
    const hour = new Date(session.startedAt).getHours()
    return hour >= 8 && hour < 12
  })

  const afternoonSessions = data.allSessions.filter((session: any) => {
    const hour = new Date(session.startedAt).getHours()
    return hour >= 12 && hour < 17
  })

  if (morningSessions.length > afternoonSessions.length * 1.5) {
    insights.push("You're most productive in the mornings. Consider scheduling your most important tasks before noon.")
  } else if (afternoonSessions.length > morningSessions.length * 1.5) {
    insights.push("You seem to be an afternoon person. Try scheduling challenging tasks in the early afternoon.")
  }

  // Default insight if no specific patterns
  if (insights.length === 0) {
    insights.push("Keep building your focus habit! More data will help provide personalized insights.")
  }

  return insights
}
