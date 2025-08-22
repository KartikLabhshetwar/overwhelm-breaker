"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { FolderOpen, Calendar, Clock, CheckCircle, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  totalTasks: number
  completedTasks: number
  totalChunks: number
  completedChunks: number
  estimatedHours: number
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    const fetchProjects = async () => {
      try {
        setError(null)
        const response = await fetch("/api/projects")
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`)
        }
        const data = await response.json()
        setProjects(data.projects || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
        setError("Failed to load projects. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [session, status, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
                Your Projects
              </h1>
              <p className="text-sm sm:text-base text-emerald-700">Track progress across all your projects</p>
            </div>

            <Link href="/capture" className="flex-shrink-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto h-10 sm:h-auto text-sm sm:text-base">
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">New Project</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <Card className="border-emerald-200">
            <CardContent className="text-center py-8 sm:py-12">
              <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-emerald-900 mb-2">No projects yet</h3>
              <p className="text-sm sm:text-base text-emerald-700 mb-4">
                Start by creating your first project breakdown
              </p>
              <Link href="/capture">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="border-emerald-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <CardTitle className="text-emerald-900 text-base sm:text-lg leading-tight min-w-0 flex-1 line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <Badge variant="outline" className={`${getStatusColor(project.status)} text-xs flex-shrink-0`}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription className="text-emerald-700 line-clamp-3 text-sm sm:text-base leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-emerald-700 truncate">
                          {project.completedTasks}/{project.totalTasks} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-emerald-700 truncate">
                          {project.completedChunks}/{project.totalChunks} chunks
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-emerald-100 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${project.totalChunks > 0 ? (project.completedChunks / project.totalChunks) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-2 text-xs text-emerald-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">Created {formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex-shrink-0">~{project.estimatedHours}h total</div>
                    </div>

                    <div className="flex flex-col xs:flex-row gap-2 pt-2">
                      <Link href={`/projects/${project.id}/breakdown`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Link href="/schedule" className="xs:flex-shrink-0">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 w-full xs:w-auto text-xs sm:text-sm h-8 sm:h-9"
                        >
                          Schedule
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
