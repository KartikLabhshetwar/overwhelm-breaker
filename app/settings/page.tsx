"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"
import { ArrowLeft, User, Clock, Zap, Brain, Save } from "lucide-react"
import Link from "next/link"

interface UserPreferences {
  timezone: string
  workHours: {
    start: string
    end: string
  }
  energyProfile: {
    morning: number
    afternoon: number
    evening: number
  }
  defaultChunkMinutes: number
  personalizedRecommendations: boolean
  smartScheduling: boolean
  breakReminders: boolean
  weeklyReports: boolean
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [preferences, setPreferences] = useState<UserPreferences>({
    timezone: "UTC",
    workHours: { start: "09:00", end: "17:00" },
    energyProfile: { morning: 80, afternoon: 60, evening: 40 },
    defaultChunkMinutes: 10,
    personalizedRecommendations: true,
    smartScheduling: true,
    breakReminders: true,
    weeklyReports: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences")
        if (response.ok) {
          const data = await response.json()
          setPreferences({ ...preferences, ...data })
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
  }, [session])

  const savePreferences = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        // Show success feedback
        console.log("Preferences saved successfully")
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsSaving(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">Personal Settings</h1>
              <p className="text-emerald-700">Customize your productivity experience</p>
            </div>

            <Button onClick={savePreferences} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile & Timezone
              </CardTitle>
              <CardDescription className="text-emerald-700">Basic profile and location settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-emerald-800">
                    Timezone
                  </Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                  >
                    <SelectTrigger className="border-emerald-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultChunk" className="text-emerald-800">
                    Default Chunk Duration
                  </Label>
                  <Select
                    value={preferences.defaultChunkMinutes.toString()}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, defaultChunkMinutes: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger className="border-emerald-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Hours */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Work Hours
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Set your typical work schedule for smart scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workStart" className="text-emerald-800">
                    Work Start Time
                  </Label>
                  <Input
                    id="workStart"
                    type="time"
                    value={preferences.workHours.start}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        workHours: { ...preferences.workHours, start: e.target.value },
                      })
                    }
                    className="border-emerald-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workEnd" className="text-emerald-800">
                    Work End Time
                  </Label>
                  <Input
                    id="workEnd"
                    type="time"
                    value={preferences.workHours.end}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        workHours: { ...preferences.workHours, end: e.target.value },
                      })
                    }
                    className="border-emerald-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energy Profile */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Energy Profile
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Tell us about your energy levels throughout the day for optimal scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-emerald-800">Morning Energy (6 AM - 12 PM)</Label>
                    <span className="text-sm font-medium text-emerald-900">{preferences.energyProfile.morning}%</span>
                  </div>
                  <Slider
                    value={[preferences.energyProfile.morning]}
                    onValueChange={(value) =>
                      setPreferences({
                        ...preferences,
                        energyProfile: { ...preferences.energyProfile, morning: value[0] },
                      })
                    }
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-emerald-800">Afternoon Energy (12 PM - 6 PM)</Label>
                    <span className="text-sm font-medium text-emerald-900">{preferences.energyProfile.afternoon}%</span>
                  </div>
                  <Slider
                    value={[preferences.energyProfile.afternoon]}
                    onValueChange={(value) =>
                      setPreferences({
                        ...preferences,
                        energyProfile: { ...preferences.energyProfile, afternoon: value[0] },
                      })
                    }
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-emerald-800">Evening Energy (6 PM - 10 PM)</Label>
                    <span className="text-sm font-medium text-emerald-900">{preferences.energyProfile.evening}%</span>
                  </div>
                  <Slider
                    value={[preferences.energyProfile.evening]}
                    onValueChange={(value) =>
                      setPreferences({
                        ...preferences,
                        energyProfile: { ...preferences.energyProfile, evening: value[0] },
                      })
                    }
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI & Personalization */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI & Personalization
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Control how the AI learns from your behavior and provides recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-emerald-800">Personalized Recommendations</Label>
                  <p className="text-sm text-emerald-600">
                    Let AI learn from your patterns to provide better task breakdowns
                  </p>
                </div>
                <Switch
                  checked={preferences.personalizedRecommendations}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, personalizedRecommendations: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-emerald-800">Smart Scheduling</Label>
                  <p className="text-sm text-emerald-600">
                    Automatically suggest optimal times based on your energy profile
                  </p>
                </div>
                <Switch
                  checked={preferences.smartScheduling}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, smartScheduling: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-emerald-800">Break Reminders</Label>
                  <p className="text-sm text-emerald-600">Get notified when it's time for a break</p>
                </div>
                <Switch
                  checked={preferences.breakReminders}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, breakReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-emerald-800">Weekly Reports</Label>
                  <p className="text-sm text-emerald-600">Receive weekly productivity insights via email</p>
                </div>
                <Switch
                  checked={preferences.weeklyReports}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
