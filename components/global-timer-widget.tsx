"use client"

import { useTimer } from "@/contexts/timer-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export function GlobalTimerWidget() {
  const { timerState, pauseTimer, resumeTimer, stopTimer } = useTimer()
  const router = useRouter()

  if (!timerState.chunkId) return null

  const minutes = Math.floor(timerState.timeLeft / 60)
  const seconds = timerState.timeLeft % 60
  const progress = ((timerState.totalDuration - timerState.timeLeft) / timerState.totalDuration) * 100

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] md:w-80">
      <Card className="border-emerald-200 bg-white/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-sm font-medium text-emerald-900 truncate">{timerState.chunkTitle}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/focus/${timerState.chunkId}`)}
                className="text-emerald-600 hover:text-emerald-700 flex-shrink-0"
              >
                View
              </Button>
            </div>

            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-emerald-900">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <Progress value={progress} className="w-full h-2 mt-2" />
            </div>

            <div className="flex justify-center gap-2">
              {timerState.isRunning ? (
                <Button onClick={pauseTimer} size="sm" variant="outline" className="border-emerald-200 bg-transparent">
                  <Pause className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={resumeTimer} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Play className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={stopTimer} size="sm" variant="outline" className="border-emerald-200 bg-transparent">
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
