"use client"

import { SessionProvider } from "next-auth/react"
import { TimerProvider } from "@/contexts/timer-context"
import type React from "react"

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <TimerProvider>{children}</TimerProvider>
    </SessionProvider>
  )
}

export { SessionProvider }
