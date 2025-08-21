import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { chunks, users } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"

interface ChunkWithDetails {
  id: string
  title: string
  durationMin: number
  energy: "low" | "med" | "high"
  deps: string[]
  orderIndex: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { date, chunkIds } = body

    if (!chunkIds || chunkIds.length === 0) {
      return NextResponse.json({ error: "No chunks to schedule" }, { status: 400 })
    }

    // Get user preferences for personalized scheduling
    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    const userPrefs = user[0]

    // Get chunk details
    const chunksToSchedule = await db
      .select({
        id: chunks.id,
        title: chunks.title,
        durationMin: chunks.durationMin,
        energy: chunks.energy,
        deps: chunks.deps,
        orderIndex: chunks.orderIndex,
      })
      .from(chunks)
      .where(inArray(chunks.id, chunkIds))

    // Personalized scheduling algorithm
    const scheduledChunks = personalizedAutoSchedule(chunksToSchedule, date, userPrefs)

    // Update database with scheduled times
    for (const scheduledChunk of scheduledChunks) {
      await db
        .update(chunks)
        .set({
          scheduledStart: scheduledChunk.scheduledStart,
          scheduledEnd: scheduledChunk.scheduledEnd,
        })
        .where(eq(chunks.id, scheduledChunk.id))
    }

    return NextResponse.json({
      success: true,
      scheduled: scheduledChunks.length,
    })
  } catch (error) {
    console.error("Error auto-scheduling:", error)
    return NextResponse.json({ error: "Failed to auto-schedule chunks" }, { status: 500 })
  }
}

function personalizedAutoSchedule(chunks: any[], date: string, userPrefs: any) {
  // Use user's energy profile and work hours for personalized scheduling
  const workStart = Number.parseInt(userPrefs?.workHours?.start?.split(":")[0] || "9")
  const workEnd = Number.parseInt(userPrefs?.workHours?.end?.split(":")[0] || "17")
  const energyProfile = userPrefs?.energyProfile || { morning: 80, afternoon: 60, evening: 40 }

  // Define personalized energy-based time preferences
  const getOptimalHours = (energy: string) => {
    switch (energy) {
      case "high":
        return energyProfile.morning > energyProfile.afternoon
          ? [workStart, workStart + 1, workStart + 2]
          : [workStart + 4, workStart + 5, workStart + 6]
      case "med":
        return [workStart + 2, workStart + 3, workStart + 5, workStart + 6]
      case "low":
        return energyProfile.evening > 30 ? [workEnd - 2, workEnd - 1] : [workStart + 7, workStart + 8]
      default:
        return [workStart + 2, workStart + 3, workStart + 4]
    }
  }

  // Sort chunks by energy level and order index
  const sortedChunks = [...chunks].sort((a, b) => {
    const energyPriority = { high: 3, med: 2, low: 1 }
    if (energyPriority[a.energy] !== energyPriority[b.energy]) {
      return energyPriority[b.energy] - energyPriority[a.energy]
    }
    return a.orderIndex - b.orderIndex
  })

  const scheduledChunks = []
  const usedTimeSlots = new Set<string>()

  for (const chunk of sortedChunks) {
    const preferredHours = getOptimalHours(chunk.energy).filter((hour) => hour >= workStart && hour < workEnd)
    let scheduled = false

    // Try to find a suitable time slot based on user preferences
    for (const hour of preferredHours) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
        const endTime = new Date(new Date(startTime).getTime() + chunk.durationMin * 60000).toISOString()

        const timeSlotKey = `${hour}:${minute}`

        if (!usedTimeSlots.has(timeSlotKey)) {
          scheduledChunks.push({
            ...chunk,
            scheduledStart: new Date(startTime),
            scheduledEnd: new Date(endTime),
          })
          usedTimeSlots.add(timeSlotKey)
          scheduled = true
          break
        }
      }
      if (scheduled) break
    }

    // Fallback to any available slot if preferred times are taken
    if (!scheduled) {
      for (let hour = workStart; hour < workEnd; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeSlotKey = `${hour}:${minute}`

          if (!usedTimeSlots.has(timeSlotKey)) {
            const startTime = `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
            const endTime = new Date(new Date(startTime).getTime() + chunk.durationMin * 60000).toISOString()

            scheduledChunks.push({
              ...chunk,
              scheduledStart: new Date(startTime),
              scheduledEnd: new Date(endTime),
            })
            usedTimeSlots.add(timeSlotKey)
            scheduled = true
            break
          }
        }
        if (scheduled) break
      }
    }
  }

  return scheduledChunks
}
