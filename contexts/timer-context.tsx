"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface TimerState {
  chunkId: string | null
  sessionId: string | null
  timeLeft: number
  isRunning: boolean
  totalDuration: number
  chunkTitle: string
}

interface TimerContextType {
  timerState: TimerState
  startTimer: (chunkId: string, sessionId: string, duration: number, title: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  updateTimeLeft: (time: number) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>({
    chunkId: null,
    sessionId: null,
    timeLeft: 0,
    isRunning: false,
    totalDuration: 0,
    chunkTitle: "",
  })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
        }))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerState.isRunning, timerState.timeLeft])

  useEffect(() => {
    const savedState = localStorage.getItem("timerState")
    if (savedState) {
      const parsed = JSON.parse(savedState)
      setTimerState(parsed)
    }
  }, [])

  useEffect(() => {
    if (timerState.chunkId) {
      localStorage.setItem("timerState", JSON.stringify(timerState))
    }
  }, [timerState])

  const startTimer = (chunkId: string, sessionId: string, duration: number, title: string) => {
    setTimerState({
      chunkId,
      sessionId,
      timeLeft: duration,
      isRunning: true,
      totalDuration: duration,
      chunkTitle: title,
    })
  }

  const pauseTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }))
  }

  const resumeTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: true }))
  }

  const stopTimer = () => {
    setTimerState({
      chunkId: null,
      sessionId: null,
      timeLeft: 0,
      isRunning: false,
      totalDuration: 0,
      chunkTitle: "",
    })
    localStorage.removeItem("timerState")
  }

  const updateTimeLeft = (time: number) => {
    setTimerState((prev) => ({ ...prev, timeLeft: time }))
  }

  return (
    <TimerContext.Provider
      value={{
        timerState,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        updateTimeLeft,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
