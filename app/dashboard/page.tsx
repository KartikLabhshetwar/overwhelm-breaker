"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Clock, Target, Calendar, BarChart3 } from 'lucide-react'
import { Navigation } from "@/components/navigation"
import Link from "next/link"

interface DashboardStats {
  activeProjects: number
  todayChunks: number
  weekFocusTime: number
  completionRate: number
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

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    fetchStats()
  }, [session])

  if (status === "loading") {
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
              <div className="text-center py-8 text-emerald-600">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 transition-transform duration-300 hover:scale-110" />
                <p>No chunks scheduled for today</p>
                <p className="text-sm mt-2">Create a project to get started!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
