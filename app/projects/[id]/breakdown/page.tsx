"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ArrowLeft, Clock, Zap, CheckCircle, Calendar, Play } from "lucide-react"
import Link from "next/link"

interface Chunk {
  id: string
  title: string
  description: string
  durationMin: number
  energy: "low" | "med" | "high"
  resources: string[]
  acceptanceCriteria: string
  status: string
  orderIndex: number
}

interface Task {
  id: string
  title: string
  notes: string
  estimateMin: number
  status: string
  chunks: Chunk[]
}

interface Project {
  id: string
  title: string
  description: string
  priority: string
  status: string
  tasks: Task[]
}

export default function ProjectBreakdownPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data)
        }
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [params.id, session])

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-emerald-700">Project not found</p>
        </div>
      </div>
    )
  }

  const totalChunks = project.tasks.reduce((sum, task) => sum + task.chunks.length, 0)
  const totalMinutes = project.tasks.reduce(
    (sum, task) => sum + task.chunks.reduce((taskSum, chunk) => taskSum + chunk.durationMin, 0),
    0,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">{project.title}</h1>
              <p className="text-emerald-700 mb-4">{project.description}</p>
            </div>
            <Badge className={getPriorityColor(project.priority)}>{project.priority} priority</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600">Total Chunks</p>
                    <p className="text-2xl font-bold text-emerald-900">{totalChunks}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600">Estimated Time</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600">Tasks</p>
                    <p className="text-2xl font-bold text-emerald-900">{project.tasks.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {project.tasks.map((task, taskIndex) => (
            <Card key={task.id} className="border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-900">
                  Task {taskIndex + 1}: {task.title}
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  {task.notes} • Estimated: {task.estimateMin} minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {task.chunks.map((chunk, chunkIndex) => (
                    <div key={chunk.id} className="border border-emerald-100 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-emerald-900 mb-1">
                            Chunk {chunkIndex + 1}: {chunk.title}
                          </h4>
                          <p className="text-sm text-emerald-700 mb-2">{chunk.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className={getEnergyColor(chunk.energy)}>
                            <Zap className="w-3 h-3 mr-1" />
                            {chunk.energy} energy
                          </Badge>
                          <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                            <Clock className="w-3 h-3 mr-1" />
                            {chunk.durationMin}min
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-emerald-800">Success criteria:</span>
                          <p className="text-emerald-700">{chunk.acceptanceCriteria}</p>
                        </div>

                        {chunk.resources.length > 0 && (
                          <div>
                            <span className="font-medium text-emerald-800">Resources needed:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {chunk.resources.map((resource, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                          asChild
                        >
                          <Link href={`/focus/${chunk.id}`}>
                            <Play className="w-3 h-3 mr-1" />
                            Start Chunk
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
