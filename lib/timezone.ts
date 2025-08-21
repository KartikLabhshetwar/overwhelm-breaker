import { format, toZonedTime, fromZonedTime } from "date-fns-tz"

export const TIMEZONES = {
  UTC: "UTC",
  "Asia/Kolkata": "India Standard Time (IST)",
  "America/New_York": "Eastern Time",
  "America/Chicago": "Central Time",
  "America/Denver": "Mountain Time",
  "America/Los_Angeles": "Pacific Time",
  "Europe/London": "London",
  "Europe/Paris": "Paris",
  "Asia/Tokyo": "Tokyo",
  "Asia/Shanghai": "Shanghai",
  "Asia/Dubai": "Dubai",
  "Australia/Sydney": "Sydney",
} as const

export type TimezoneKey = keyof typeof TIMEZONES

// Convert UTC date to user's timezone
export function toUserTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone)
}

// Convert user's timezone date to UTC
export function fromUserTimezone(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone)
}

// Format date in user's timezone
export function formatInTimezone(date: Date, timezone: string, formatString = "yyyy-MM-dd HH:mm:ss"): string {
  return format(toZonedTime(date, timezone), formatString, { timeZone: timezone })
}

// Get current time in user's timezone
export function getCurrentTimeInTimezone(timezone: string): Date {
  return toUserTimezone(new Date(), timezone)
}

// Check if timezone is IST
export function isIST(timezone: string): boolean {
  return timezone === "Asia/Kolkata"
}

// Get IST offset
export function getISTOffset(): string {
  return "+05:30"
}

// Convert time string to user's timezone (for work hours)
export function convertWorkHoursToTimezone(timeString: string, fromTimezone: string, toTimezone: string): string {
  const today = new Date()
  const [hours, minutes] = timeString.split(":").map(Number)

  // Create date with the time in the source timezone
  const dateInSourceTz = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes)
  const utcDate = fromUserTimezone(dateInSourceTz, fromTimezone)
  const dateInTargetTz = toUserTimezone(utcDate, toTimezone)

  return format(dateInTargetTz, "HH:mm")
}

// Get timezone display name
export function getTimezoneDisplayName(timezone: string): string {
  return TIMEZONES[timezone as TimezoneKey] || timezone
}

// Detect user's timezone
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "UTC"
  }
}
