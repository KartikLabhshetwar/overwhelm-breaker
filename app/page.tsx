import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Timer, Target, Calendar, BarChart3, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="animate-in fade-in duration-1000">
                <h1 className="font-bold text-4xl md:text-6xl lg:text-7xl mb-6 text-foreground leading-tight">
                  Turn Overwhelming Tasks Into
                  <span className="text-primary block mt-2 animate-in slide-in-from-left duration-1000 delay-300">
                    10-Minute Wins
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed animate-in fade-in duration-1000 delay-500">
                  AI-powered task breakdown that transforms your biggest challenges into manageable chunks, scheduled
                  perfectly with focus timers and gentle nudges.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in duration-1000 delay-700">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  asChild
                >
                  <a href="/capture">
                    Start Breaking Down Tasks
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  See How It Works
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Four simple steps to transform overwhelming projects into achievable progress
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in duration-1000 delay-300">
                <CardHeader>
                  <Target className="w-12 h-12 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
                  <CardTitle>Smart Breakdown</CardTitle>
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
                  <CardTitle>Auto Scheduling</CardTitle>
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
                  <CardTitle>Focus Timer</CardTitle>
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
                  <CardTitle>Progress Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Learn from your patterns with completion analytics and personalized productivity insights.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">Stop Procrastinating, Start Progressing</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Break the Overwhelm Cycle</h3>
                      <p className="text-muted-foreground">
                        Transform paralyzing big tasks into clear, actionable steps you can tackle immediately.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Build Momentum Daily</h3>
                      <p className="text-muted-foreground">
                        Complete meaningful work in just 10 minutes and watch your progress compound over time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Stay Consistently Focused</h3>
                      <p className="text-muted-foreground">
                        Gentle timers and check-ins keep you on track without the pressure of long work sessions.
                      </p>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/capture">Try It Free Today</a>
                </Button>
              </div>
              <div className="lg:pl-12">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
                  <div className="text-6xl font-bold text-primary mb-2">10</div>
                  <div className="text-xl font-semibold mb-4">Minutes to Progress</div>
                  <p className="text-muted-foreground">
                    The perfect amount of time to make meaningful progress without feeling overwhelmed or losing focus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center animate-in fade-in duration-1000 delay-1100">
              <Card className="max-w-4xl mx-auto transition-all duration-300 hover:shadow-xl border-primary/20">
                <CardHeader className="pb-8">
                  <CardTitle className="text-3xl lg:text-4xl font-bold">Ready to Break Down Your First Task?</CardTitle>
                  <CardDescription className="text-xl">
                    Start with something that's been on your mind - we'll show you how it works.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    asChild
                  >
                    <a href="/capture">
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
