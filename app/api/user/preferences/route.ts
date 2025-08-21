import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = user[0]
    return NextResponse.json({
      timezone: userData.timezone,
      workHours: userData.workHours,
      energyProfile: userData.energyProfile,
      defaultChunkMinutes: userData.defaultChunkMinutes,
      personalizedRecommendations: true,
      smartScheduling: true,
      breakReminders: true,
      weeklyReports: true,
    })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { timezone, workHours, energyProfile, defaultChunkMinutes } = body

    await db
      .update(users)
      .set({
        timezone,
        workHours,
        energyProfile,
        defaultChunkMinutes,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}
