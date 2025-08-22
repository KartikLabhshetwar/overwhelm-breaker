"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, Target, Calendar, BarChart3, Zap } from 'lucide-react'
import { Navigation } from "@/components/navigation"
import Link from "next/link"

interface DashboardStats {
  activeProjects: number
  todayChunks: number
  weekFocusTime: number
  completionRate: number
}

interface ScheduledChunk {
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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    todayChunks: 0,
    weekFocusTime: 0,
    completionRate: 0,
  })
  const [todayChunks, setTodayChunks] = useState<ScheduledChunk[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await fetch("/api/dashboard/stats")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch today's scheduled chunks
        const chunksResponse = await fetch("/api/chunks/unscheduled")
        if (chunksResponse.ok) {
          const chunksData = await chunksResponse.json()
          // Filter for today's scheduled chunks
          const today = new Date().toISOString().split('T')[0]
          const todaysChunks = chunksData.scheduled.filter((chunk: ScheduledChunk) => {
            if (!chunk.scheduledStart) return false
            return chunk.scheduledStart.startsWith(today)
          })
          setTodayChunks(todaysChunks)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

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

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return ""
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-in fade-in duration-700">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Welcome back, {session.user?.name}!</h1>
          <p className="text-emerald-700">Ready to break down some overwhelming tasks?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-700 delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Active Projects</CardTitle>
              <Target className="h-4 w-4 text-emerald-600 transition-transform duration-300 hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{stats.activeProjects}</div>
              <p className="text-xs text-emerald-600">
                {stats.activeProjects === 0 ? "No projects yet" : "Projects in progress"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-700 delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Today's Chunks</CardTitle>
              <Clock className="h-4 w-4 text-emerald-600 transition-transform duration-300 hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{stats.todayChunks}</div>
              <p className="text-xs text-emerald-600">
                {stats.todayChunks === 0 ? "Nothing scheduled" : "Scheduled for today"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-700 delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Focus Time</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-600 transition-transform duration-300 hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">
                {Math.floor(stats.weekFocusTime / 60)}h {stats.weekFocusTime % 60}m
              </div>
              <p className="text-xs text-emerald-600">This week</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-700 delay-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-emerald-600 transition-transform duration-300 hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">
                {stats.completionRate > 0 ? `${Math.round(stats.completionRate)}%` : "--%"}
              </div>
              <p className="text-xs text-emerald-600">
                {stats.completionRate === 0 ? "No data yet" : "Sessions completed"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-emerald-200 transition-all duration-300 hover:shadow-lg animate-in fade-in duration-700 delay-500">
            <CardHeader>
              <CardTitle className="text-emerald-900">Quick Actions</CardTitle>
              <CardDescription className="text-emerald-700">Get started with your productivity journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:scale-105" asChild>
                <Link href="/capture">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent transition-all duration-200 hover:scale-105"
                asChild
              >
                <Link href="/schedule">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Your Chunks
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent transition-all duration-200 hover:scale-105"
                asChild
              >
                <Link href="/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <p className="text-sm text-emerald-600 text-center">
                Describe what's overwhelming you, and I'll break it down into manageable chunks
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 transition-all duration-300 hover:shadow-lg animate-in fade-in duration-700 delay-600">
            <CardHeader>
              <CardTitle className="text-emerald-900">Today's Schedule</CardTitle>
              <CardDescription className="text-emerald-700">Your focus chunks for today</CardDescription>
            </CardHeader>
            <CardContent>
              {todayChunks.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {todayChunks.map((chunk) => (
                    <div key={chunk.id} className="border border-emerald-100 rounded-lg p-3 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-emerald-900 text-sm truncate">{chunk.title}</h4>
                          <p className="text-xs text-emerald-600 truncate">{chunk.projectTitle} • {chunk.taskTitle}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <Badge variant="outline" className={`${getEnergyColor(chunk.energy)} text-xs`}>
                            <Zap className="w-2 h-2 mr-1" />
                            {chunk.energy}
                          </Badge>
                          <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs">
                            {chunk.durationMin}m
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-emerald-700">
                          {formatTime(chunk.scheduledStart)} - {formatTime(chunk.scheduledEnd)}
                        </p>
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <Link href={`/focus/${chunk.id}`}>Start</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-emerald-600">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No chunks scheduled for today</p>
                  <p className="text-sm mt-2">Create a project to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
