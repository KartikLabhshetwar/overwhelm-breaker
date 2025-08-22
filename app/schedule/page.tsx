"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Calendar, Zap, Plus, ArrowLeft, Brain } from "lucide-react"
import Link from "next/link"

interface Chunk {
  id: string
  title: string
  description: string
  durationMin: number
  energy: "low" | "med" | "high"
  status: string
  scheduledStart?: string
  scheduledEnd?: string
  taskTitle: string
  projectTitle: string
}

interface TimeSlot {
  start: string
  end: string
  chunk?: Chunk
  available: boolean
}

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [unscheduledChunks, setUnscheduledChunks] = useState<Chunk[]>([])
  const [scheduledChunks, setScheduledChunks] = useState<Chunk[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    if (!session?.user?.id) return

    const fetchChunks = async () => {
      try {
        setError(null)
        const response = await fetch("/api/chunks/unscheduled")
        if (!response.ok) {
          throw new Error(`Failed to fetch chunks: ${response.status}`)
        }
        const data = await response.json()
        setUnscheduledChunks(data.unscheduled || [])
        setScheduledChunks(data.scheduled || [])
      } catch (error) {
        console.error("Error fetching chunks:", error)
        setError("Failed to load chunks. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChunks()
  }, [session, status, router])

  useEffect(() => {
    generateTimeSlots()
  }, [selectedDate, scheduledChunks])

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []
    const startHour = 9 // 9 AM
    const endHour = 17 // 5 PM
    const slotDuration = 30 // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const start = `${selectedDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
        const end = `${selectedDate}T${String(hour + Math.floor((minute + slotDuration) / 60)).padStart(2, "0")}:${String((minute + slotDuration) % 60).padStart(2, "0")}:00`

        // Check if this slot has a scheduled chunk
        const scheduledChunk = scheduledChunks.find((chunk) => {
          if (!chunk.scheduledStart) return false
          const chunkStart = new Date(chunk.scheduledStart)
          const slotStart = new Date(start)
          return chunkStart.getTime() === slotStart.getTime()
        })

        slots.push({
          start,
          end,
          chunk: scheduledChunk,
          available: !scheduledChunk,
        })
      }
    }

    setTimeSlots(slots)
  }

  const scheduleChunk = async (chunkId: string, startTime: string) => {
    try {
      setError(null)
      const chunk = unscheduledChunks.find((c) => c.id === chunkId)
      if (!chunk) return

      const start = new Date(startTime)
      const end = new Date(start.getTime() + chunk.durationMin * 60000)

      const response = await fetch(`/api/chunks/${chunkId}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to schedule chunk: ${response.status}`)
      }

      // Update local state
      const updatedChunk = { ...chunk, scheduledStart: start.toISOString(), scheduledEnd: end.toISOString() }
      setScheduledChunks([...scheduledChunks, updatedChunk])
      setUnscheduledChunks(unscheduledChunks.filter((c) => c.id !== chunkId))
    } catch (error) {
      console.error("Error scheduling chunk:", error)
      setError("Failed to schedule chunk. Please try again.")
    }
  }

  const unscheduleChunk = async (chunkId: string) => {
    try {
      const response = await fetch(`/api/chunks/${chunkId}/schedule`, {
        method: "DELETE",
      })

      if (response.ok) {
        const chunk = scheduledChunks.find((c) => c.id === chunkId)
        if (chunk) {
          const unscheduledChunk = { ...chunk, scheduledStart: undefined, scheduledEnd: undefined }
          setUnscheduledChunks([...unscheduledChunks, unscheduledChunk])
          setScheduledChunks(scheduledChunks.filter((c) => c.id !== chunkId))
        }
      }
    } catch (error) {
      console.error("Error unscheduling chunk:", error)
    }
  }

  const autoSchedule = async () => {
    try {
      const response = await fetch("/api/schedule/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          chunkIds: unscheduledChunks.map((c) => c.id),
        }),
      })

      if (response.ok) {
        // Refresh the chunks
        const chunksResponse = await fetch("/api/chunks/unscheduled")
        if (chunksResponse.ok) {
          const data = await chunksResponse.json()
          setUnscheduledChunks(data.unscheduled || [])
          setScheduledChunks(data.scheduled || [])
        }
      }
    } catch (error) {
      console.error("Error auto-scheduling:", error)
    }
  }

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "med":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-2 leading-tight">
                Schedule Your Chunks
              </h1>
              <p className="text-sm sm:text-base text-emerald-700">
                Plan your focused work sessions for maximum productivity
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-shrink-0">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-400 focus:outline-none text-sm sm:text-base h-10 sm:h-auto"
              />
              <Button
                onClick={autoSchedule}
                className="bg-emerald-600 hover:bg-emerald-700 h-10 sm:h-auto text-sm sm:text-base"
                disabled={unscheduledChunks.length === 0}
              >
                <Brain className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Auto Schedule</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Unscheduled Chunks */}
          <Card className="border-emerald-200 xl:order-1 order-2">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-emerald-900 flex items-center text-lg sm:text-xl">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Unscheduled ({unscheduledChunks.length})</span>
              </CardTitle>
              <CardDescription className="text-emerald-700 text-sm sm:text-base">
                Drag chunks to schedule them or use auto-schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
              {unscheduledChunks.length === 0 ? (
                <p className="text-emerald-600 text-center py-6 sm:py-8 text-sm sm:text-base">
                  All chunks are scheduled!
                </p>
              ) : (
                unscheduledChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="p-2 sm:p-3 border border-emerald-100 rounded-lg bg-white cursor-move hover:shadow-md transition-shadow touch-manipulation"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("chunkId", chunk.id)}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="font-medium text-emerald-900 text-sm sm:text-base leading-tight min-w-0 flex-1">
                        {chunk.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant="outline" className={`${getEnergyColor(chunk.energy)} text-xs`}>
                          <Zap className="w-2 h-2 mr-1" />
                          {chunk.energy}
                        </Badge>
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs">
                          {chunk.durationMin}m
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-600 mb-1 truncate">
                      {chunk.projectTitle} • {chunk.taskTitle}
                    </p>
                    <p className="text-xs text-emerald-700 line-clamp-2 leading-relaxed">{chunk.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card className="xl:col-span-2 border-emerald-200 xl:order-2 order-1">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-emerald-900 flex items-center text-lg sm:text-xl">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </CardTitle>
              <CardDescription className="text-emerald-700 text-sm sm:text-base">
                Your scheduled focus sessions for the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 sm:space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`p-2 sm:p-3 rounded-lg border transition-colors touch-manipulation ${
                      slot.chunk ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200 hover:bg-emerald-25"
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const chunkId = e.dataTransfer.getData("chunkId")
                      if (chunkId && slot.available) {
                        scheduleChunk(chunkId, slot.start)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-medium text-emerald-800 min-w-[60px] sm:min-w-[80px] flex-shrink-0">
                          {formatTime(slot.start)}
                        </span>

                        {slot.chunk ? (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                              <h4 className="font-medium text-emerald-900 text-xs sm:text-sm truncate min-w-0">
                                {slot.chunk.title}
                              </h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Badge variant="outline" className={`${getEnergyColor(slot.chunk.energy)} text-xs`}>
                                  <Zap className="w-2 h-2 mr-1" />
                                  {slot.chunk.energy}
                                </Badge>
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs">
                                  {slot.chunk.durationMin}m
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-emerald-600 truncate">
                              {slot.chunk.projectTitle} • {slot.chunk.taskTitle}
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1 text-xs sm:text-sm text-gray-500 italic">
                            Drop a chunk here to schedule
                          </div>
                        )}
                      </div>

                      {slot.chunk && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => unscheduleChunk(slot.chunk!.id)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 text-xs sm:text-sm h-8 px-2 sm:px-3 flex-shrink-0"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduling Tips */}
        <Card className="mt-4 sm:mt-6 border-emerald-200">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-emerald-900 text-base sm:text-lg">Smart Scheduling Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                <div className="min-w-0">
                  <p className="font-medium text-emerald-900">High Energy Tasks</p>
                  <p className="text-emerald-700 leading-relaxed">
                    Schedule during your peak hours (typically morning)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                <div className="min-w-0">
                  <p className="font-medium text-emerald-900">Medium Energy Tasks</p>
                  <p className="text-emerald-700 leading-relaxed">Great for mid-morning or early afternoon</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                <div className="min-w-0">
                  <p className="font-medium text-emerald-900">Low Energy Tasks</p>
                  <p className="text-emerald-700 leading-relaxed">Perfect for after lunch or end of day</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
