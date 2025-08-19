import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Target, Calendar, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="animate-in fade-in duration-1000">
            <h1 className="font-bold text-4xl md:text-6xl mb-6 text-foreground font-[family-name:var(--font-work-sans)] leading-tight">
              Turn Overwhelming Tasks Into
              <span className="text-primary block mt-2 animate-in slide-in-from-left duration-1000 delay-300">10-Minute Wins</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-in fade-in duration-1000 delay-500">
              AI-powered task breakdown that transforms your biggest challenges into manageable chunks, scheduled
              perfectly with focus timers and gentle nudges.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in duration-1000 delay-700">
            <Button size="lg" className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg" asChild>
              <a href="/capture">Start Breaking Down Tasks</a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-md">
              See How It Works
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-1000 delay-300">
            <CardHeader>
              <Target className="w-12 h-12 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
              <CardTitle className="font-[family-name:var(--font-work-sans)]">Smart Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI analyzes your tasks and creates 8-12 minute actionable chunks with clear acceptance criteria.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-1000 delay-500">
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
              <CardTitle className="font-[family-name:var(--font-work-sans)]">Auto Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically fits chunks into your calendar, respecting your work hours and energy levels.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-1000 delay-700">
            <CardHeader>
              <Timer className="w-12 h-12 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
              <CardTitle className="font-[family-name:var(--font-work-sans)]">Focus Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Distraction-free 10-minute focus sessions with gentle check-ins and smart unblocker suggestions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-1000 delay-900">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
              <CardTitle className="font-[family-name:var(--font-work-sans)]">Progress Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Learn from your patterns with completion analytics and personalized productivity insights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center animate-in fade-in duration-1000 delay-1100">
          <Card className="max-w-4xl mx-auto transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-[family-name:var(--font-work-sans)]">
                Ready to Break Down Your First Task?
              </CardTitle>
              <CardDescription className="text-lg">
                Start with something that's been on your mind - we'll show you how it works.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button size="lg" className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg" asChild>
                <a href="/capture">Get Started Now</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
