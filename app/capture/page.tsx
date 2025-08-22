"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { ArrowLeft, Sparkles, Clock, Target } from "lucide-react"
import Link from "next/link"

export default function CapturePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
    context: "",
  })

  useEffect(() => {
    if (status !== "loading" && !session && !hasRedirected) {
      setHasRedirected(true)
      router.push("/auth/signin")
    }
  }, [session, status, hasRedirected, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/projects/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: session.user.id,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/projects/${result.projectId}/breakdown`)
      } else {
        console.error("Failed to create project breakdown")
      }
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-2 leading-tight">
            Capture Your Overwhelming Task
          </h1>
          <p className="text-sm sm:text-base text-emerald-700 leading-relaxed">
            Describe what's overwhelming you, and I'll break it down into manageable 10-minute chunks.
          </p>
        </div>

        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center text-emerald-900 text-lg sm:text-xl">
              <Sparkles className="w-5 h-5 mr-2 flex-shrink-0" />
              AI-Powered Task Breakdown
            </CardTitle>
            <CardDescription className="text-emerald-700 text-sm sm:text-base">
              The more detail you provide, the better I can help you break this down into actionable steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-emerald-800 text-sm sm:text-base font-medium">
                  Project Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Launch my new website, Organize home office, Plan wedding"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-emerald-200 focus:border-emerald-400 text-sm sm:text-base h-10 sm:h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-emerald-800 text-sm sm:text-base font-medium">
                  What's overwhelming you?
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project in detail. What needs to be done? What's making it feel overwhelming? Include any specific requirements, constraints, or goals you have in mind."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={5}
                  className="border-emerald-200 focus:border-emerald-400 text-sm sm:text-base resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-emerald-800 text-sm sm:text-base font-medium">
                    Deadline (Optional)
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-400 text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-emerald-800 text-sm sm:text-base font-medium">
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-400 h-10 sm:h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context" className="text-emerald-800 text-sm sm:text-base font-medium">
                  Additional Context (Optional)
                </Label>
                <Textarea
                  id="context"
                  placeholder="Any additional context that might help? Your experience level, available resources, time constraints, or specific challenges you're facing."
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  rows={3}
                  className="border-emerald-200 focus:border-emerald-400 text-sm sm:text-base resize-none"
                />
              </div>

              <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-emerald-900 mb-2 text-sm sm:text-base">How it works:</h4>
                    <ul className="text-xs sm:text-sm text-emerald-700 space-y-1 leading-relaxed">
                      <li>• AI analyzes your project and breaks it into logical tasks</li>
                      <li>• Each task is divided into 10-minute focused work chunks</li>
                      <li>• Chunks are sequenced based on dependencies and priorities</li>
                      <li>• You can schedule chunks into your calendar and track progress</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !formData.title || !formData.description}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 h-12 sm:h-14 text-sm sm:text-base font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="truncate">Breaking down your project...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Break Down This Project</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
