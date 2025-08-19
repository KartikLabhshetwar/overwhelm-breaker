"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Play, Pause, Square, Clock, Zap, CheckCircle, AlertCircle, Coffee } from 'lucide-react'

interface Chunk {
  id: string
  title: string
  description: string
  durationMin: number
  energy: "low" | "med" | "high"
  resources: string[]
  acceptanceCriteria: string
  status: string
}

interface Session {
  id: string
  chunkId: string
  startedAt: string
  endedAt?: string
  outcome?: "done" | "stuck" | "snoozed"
  actualMin?: number
  reflection?: string
}

export default function FocusPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [chunk, setChunk] = useState<Chunk | null>(null)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showCheckin, setShowCheckin] = useState(false)
  const [checkinSentiment, setCheckinSentiment] = useState<"good" | "neutral" | "stuck" | null>(null)
  const [blockerTag, setBlockerTag] = useState("")
  const [reflection, setReflection] = useState("")
  const [sessionComplete, setSessionComplete] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchChunk = async () => {
      try {
        const response = await fetch(`/api/chunks/${params.chunkId}`)
        if (response.ok) {
          const data = await response.json()
          setChunk(data)
          setTimeLeft(data.durationMin * 60) // Convert to seconds
        }
      } catch (error) {
        console.error("Error fetching chunk:", error)
      }
    }

    fetchChunk()
  }, [params.chunkId, session])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1

          // Show check-in at 5 minutes (halfway through 10-min chunk)
          if (chunk && newTime === Math.floor((chunk.durationMin * 60) / 2) && !showCheckin) {
            setShowCheckin(true)
          }

          // Session complete
          if (newTime <= 0) {
            setIsRunning(false)
            setSessionComplete(true)
            return 0
          }

          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, chunk, showCheckin])

  const startSession = async () => {
    if (!chunk) return

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunkId: chunk.id }),
      })

      if (response.ok) {
        const sessionData = await response.json()
        setCurrentSession(sessionData)
        setIsRunning(true)
      }
    } catch (error) {
      console.error("Error starting session:", error)
    }
  }

  const pauseSession = () => {
    setIsRunning(false)
  }

  const resumeSession = () => {
    setIsRunning(true)
  }

  const submitCheckin = async () => {
    if (!currentSession || !checkinSentiment) return

    try {
      const elapsedMin = chunk ? Math.floor((chunk.durationMin * 60 - timeLeft) / 60) : 0

      await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
          tPlusMin: elapsedMin,
          sentiment: checkinSentiment,
          blockerTag: blockerTag || null,
        }),
      })

      setShowCheckin(false)
      setCheckinSentiment(null)
      setBlockerTag("")
    } catch (error) {
      console.error("Error submitting check-in:", error)
    }
  }

  const completeSession = async (outcome: "done" | "stuck" | "snoozed") => {
    if (!currentSession || !chunk) return

    try {
      const actualMin = Math.ceil((chunk.durationMin * 60 - timeLeft) / 60)

      await fetch(`/api/sessions/${currentSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          actualMin,
          reflection: reflection || null,
        }),
      })

      // Update chunk status
      await fetch(`/api/chunks/${chunk.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: outcome === "done" ? "done" : outcome === "stuck" ? "stuck" : "snoozed",
        }),
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing session:", error)
    }
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  if (!chunk) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  const progress = chunk ? ((chunk.durationMin * 60 - timeLeft) / (chunk.durationMin * 60)) * 100 : 0
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Check-in Modal */}
        {showCheckin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md animate-in slide-in-from-bottom duration-500">
              <CardHeader>
                <CardTitle className="text-emerald-900">Quick Check-in</CardTitle>
                <CardDescription>How are you feeling about this chunk so far?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={checkinSentiment === "good" ? "default" : "outline"}
                    onClick={() => setCheckinSentiment("good")}
                    className="flex flex-col items-center p-4 h-auto transition-all duration-200 hover:scale-105"
                  >
                    <CheckCircle className="w-6 h-6 mb-1" />
                    <span className="text-xs">Going well</span>
                  </Button>
                  <Button
                    variant={checkinSentiment === "neutral" ? "default" : "outline"}
                    onClick={() => setCheckinSentiment("neutral")}
                    className="flex flex-col items-center p-4 h-auto transition-all duration-200 hover:scale-105"
                  >
                    <Clock className="w-6 h-6 mb-1" />
                    <span className="text-xs">Okay</span>
                  </Button>
                  <Button
                    variant={checkinSentiment === "stuck" ? "default" : "outline"}
                    onClick={() => setCheckinSentiment("stuck")}
                    className="flex flex-col items-center p-4 h-auto transition-all duration-200 hover:scale-105"
                  >
                    <AlertCircle className="w-6 h-6 mb-1" />
                    <span className="text-xs">Stuck</span>
                  </Button>
                </div>

                {checkinSentiment === "stuck" && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <label className="text-sm font-medium text-emerald-800">What's blocking you?</label>
                    <Textarea
                      placeholder="Briefly describe what's blocking your progress..."
                      value={blockerTag}
                      onChange={(e) => setBlockerTag(e.target.value)}
                      rows={2}
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={submitCheckin}
                    disabled={!checkinSentiment}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:scale-105"
                  >
                    Continue
                  </Button>
                  <Button variant="outline" onClick={() => setShowCheckin(false)} className="border-emerald-200 transition-all duration-200 hover:scale-105">
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session Complete Modal */}
        {sessionComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md animate-in slide-in-from-bottom duration-500">
              <CardHeader>
                <CardTitle className="text-emerald-900">Chunk Complete!</CardTitle>
                <CardDescription>How did this session go?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-800">Quick reflection (optional)</label>
                  <Textarea
                    placeholder="What did you accomplish? Any insights or blockers to note?"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => completeSession("done")}
                    className="flex flex-col items-center p-4 h-auto bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
                  >
                    <CheckCircle className="w-6 h-6 mb-1" />
                    <span className="text-xs">Done!</span>
                  </Button>
                  <Button
                    onClick={() => completeSession("stuck")}
                    className="flex flex-col items-center p-4 h-auto bg-orange-600 hover:bg-orange-700 transition-all duration-200 hover:scale-105"
                  >
                    <AlertCircle className="w-6 h-6 mb-1" />
                    <span className="text-xs">Stuck</span>
                  </Button>
                  <Button
                    onClick={() => completeSession("snoozed")}
                    className="flex flex-col items-center p-4 h-auto bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                  >
                    <Coffee className="w-6 h-6 mb-1" />
                    <span className="text-xs">Snooze</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Focus Interface */}
        <div className="space-y-6 animate-in fade-in duration-700">
          <Card className="border-emerald-200 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-emerald-900 mb-2">{chunk.title}</CardTitle>
                  <CardDescription className="text-emerald-700 mb-4">{chunk.description}</CardDescription>
                </div>
                <Badge variant="outline" className={getEnergyColor(chunk.energy)}>
                  <Zap className="w-3 h-3 mr-1" />
                  {chunk.energy} energy
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-emerald-800 mb-2">Success Criteria:</h4>
                  <p className="text-emerald-700 text-sm">{chunk.acceptanceCriteria}</p>
                </div>

                {chunk.resources.length > 0 && (
                  <div>
                    <h4 className="font-medium text-emerald-800 mb-2">Resources:</h4>
                    <div className="flex flex-wrap gap-1">
                      {chunk.resources.map((resource, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timer */}
          <Card className="border-emerald-200 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="text-6xl font-mono font-bold text-emerald-900 transition-all duration-300">
                  <span className={isRunning ? "animate-pulse" : ""}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </span>
                </div>

                <Progress value={progress} className="w-full h-3 transition-all duration-300" />

                <div className="flex justify-center gap-4">
                  {!currentSession ? (
                    <Button onClick={startSession} size="lg" className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:scale-105">
                      <Play className="w-5 h-5 mr-2" />
                      Start Focus Session
                    </Button>
                  ) : (
                    <>
                      {isRunning ? (
                        <Button
                          onClick={pauseSession}
                          size="lg"
                          variant="outline"
                          className="border-emerald-200 bg-transparent transition-all duration-200 hover:scale-105"
                        >
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button onClick={resumeSession} size="lg" className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:scale-105">
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </Button>
                      )}

                      <Button
                        onClick={() => setSessionComplete(true)}
                        size="lg"
                        variant="outline"
                        className="border-emerald-200 transition-all duration-200 hover:scale-105"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        End Session
                      </Button>
                    </>
                  )}
                </div>

                {currentSession && (
                  <p className="text-sm text-emerald-600 animate-in fade-in duration-500">Session started • Stay focused on your success criteria</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
