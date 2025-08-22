"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ArrowLeft, TrendingUp, Clock, Target, Zap, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  totalSessions: number
  totalFocusTime: number
  completionRate: number
  averageSessionLength: number
  energyDistribution: {
    high: number
    med: number
    low: number
  }
  weeklyProgress: {
    week: string
    sessions: number
    focusTime: number
    completions: number
  }[]
  recentSessions: {
    id: string
    chunkTitle: string
    projectTitle: string
    startedAt: string
    outcome: string
    actualMin: number
    reflection?: string
  }[]
  insights: string[]
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("week") // week, month, all
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics?range=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [session, timeRange])

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "done":
        return "bg-green-100 text-green-800"
      case "stuck":
        return "bg-orange-100 text-orange-800"
      case "snoozed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "done":
        return <CheckCircle className="w-4 h-4" />
      case "stuck":
        return <AlertCircle className="w-4 h-4" />
      case "snoozed":
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-emerald-700">
            No analytics data available yet. Complete some focus sessions to see insights!
          </p>
        </div>
      </div>
    )
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

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-2 leading-tight">
                Your Productivity Analytics
              </h1>
              <p className="text-sm sm:text-base text-emerald-700">
                Track your progress and optimize your focus sessions
              </p>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                onClick={() => setTimeRange("week")}
                size="sm"
                className={`text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                  timeRange === "week" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-200"
                }`}
              >
                Week
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                onClick={() => setTimeRange("month")}
                size="sm"
                className={`text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                  timeRange === "month" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-200"
                }`}
              >
                Month
              </Button>
              <Button
                variant={timeRange === "all" ? "default" : "outline"}
                onClick={() => setTimeRange("all")}
                size="sm"
                className={`text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                  timeRange === "all" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-200"
                }`}
              >
                All Time
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700">Total Sessions</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900">{analytics.totalSessions}</div>
              <p className="text-xs text-emerald-600">Focus sessions completed</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700">Focus Time</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900">
                {Math.floor(analytics.totalFocusTime / 60)}h {analytics.totalFocusTime % 60}m
              </div>
              <p className="text-xs text-emerald-600">Total focused work time</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700">Completion Rate</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900">
                {Math.round(analytics.completionRate)}%
              </div>
              <p className="text-xs text-emerald-600">Sessions completed successfully</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700">Avg Session</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900">
                {Math.round(analytics.averageSessionLength)}m
              </div>
              <p className="text-xs text-emerald-600">Average session length</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Energy Distribution */}
          <Card className="border-emerald-200">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-emerald-900 flex items-center text-base sm:text-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Energy Level Distribution
              </CardTitle>
              <CardDescription className="text-emerald-700 text-sm sm:text-base">
                How you distribute your energy across tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-emerald-800 truncate">High Energy</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(analytics.energyDistribution.high / analytics.totalSessions) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-emerald-900 min-w-[20px] text-right">
                      {analytics.energyDistribution.high}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-emerald-800 truncate">Medium Energy</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(analytics.energyDistribution.med / analytics.totalSessions) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-emerald-900 min-w-[20px] text-right">
                      {analytics.energyDistribution.med}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-emerald-800 truncate">Low Energy</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(analytics.energyDistribution.low / analytics.totalSessions) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-emerald-900 min-w-[20px] text-right">
                      {analytics.energyDistribution.low}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="border-emerald-200">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-emerald-900 flex items-center text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Weekly Progress
              </CardTitle>
              <CardDescription className="text-emerald-700 text-sm sm:text-base">
                Your productivity trend over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {analytics.weeklyProgress.map((week, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 bg-emerald-50 rounded-lg gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-emerald-900 text-sm sm:text-base truncate">{week.week}</p>
                      <p className="text-xs sm:text-sm text-emerald-700">{week.sessions} sessions</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-emerald-900 text-sm sm:text-base">
                        {Math.floor(week.focusTime / 60)}h {week.focusTime % 60}m
                      </p>
                      <p className="text-xs sm:text-sm text-emerald-700">{week.completions} completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="border-emerald-200 mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-emerald-900 text-base sm:text-lg">Productivity Insights</CardTitle>
            <CardDescription className="text-emerald-700 text-sm sm:text-base">
              AI-powered recommendations to improve your focus sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-emerald-800 text-sm sm:text-base leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="border-emerald-200">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-emerald-900 text-base sm:text-lg">Recent Sessions</CardTitle>
            <CardDescription className="text-emerald-700 text-sm sm:text-base">
              Your latest focus session activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {analytics.recentSessions.length === 0 ? (
                <p className="text-emerald-600 text-center py-6 sm:py-8 text-sm sm:text-base">
                  No sessions completed yet
                </p>
              ) : (
                analytics.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 sm:p-4 border border-emerald-100 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-1">
                        <h4 className="font-medium text-emerald-900 text-sm sm:text-base truncate min-w-0 flex-1">
                          {session.chunkTitle}
                        </h4>
                        <Badge className={`${getOutcomeColor(session.outcome)} text-xs flex-shrink-0`}>
                          {getOutcomeIcon(session.outcome)}
                          <span className="ml-1 capitalize">{session.outcome}</span>
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-700 mb-2 truncate">{session.projectTitle}</p>
                      {session.reflection && (
                        <p className="text-xs sm:text-sm text-emerald-600 italic line-clamp-2 leading-relaxed">
                          "{session.reflection}"
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right text-xs sm:text-sm text-emerald-600 flex-shrink-0">
                      <p>{new Date(session.startedAt).toLocaleDateString()}</p>
                      <p>{session.actualMin} minutes</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
