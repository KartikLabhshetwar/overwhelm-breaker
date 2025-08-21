"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TIMEZONES, getTimezoneDisplayName, detectUserTimezone } from "@/lib/timezone"
import { useEffect, useState } from "react"

interface TimezoneSelectorProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function TimezoneSelector({ value, onValueChange, className }: TimezoneSelectorProps) {
  const [detectedTimezone, setDetectedTimezone] = useState<string>("")

  useEffect(() => {
    setDetectedTimezone(detectUserTimezone())
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        {detectedTimezone && detectedTimezone !== value && (
          <>
            <SelectItem value={detectedTimezone}>{getTimezoneDisplayName(detectedTimezone)} (Detected)</SelectItem>
            <div className="border-t my-1" />
          </>
        )}
        {Object.entries(TIMEZONES).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
            {key === "Asia/Kolkata" && " (IST)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
