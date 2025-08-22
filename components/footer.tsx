import { Timer, Github, Twitter, Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Overwhelm Breaker</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transform overwhelming tasks into manageable 10-minute wins with AI-powered breakdown and focus timers.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/capture" className="text-muted-foreground hover:text-primary transition-colors">
                  Task Breakdown
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-muted-foreground hover:text-primary transition-colors">
                  Smart Scheduling
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-muted-foreground hover:text-primary transition-colors">
                  Progress Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="text-muted-foreground hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Overwhelm Breaker. Built with focus and intention.</p>
        </div>
      </div>
    </footer>
  )
}
