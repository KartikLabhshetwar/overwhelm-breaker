import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-foreground/10 bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Overwhelm Breaker. All rights reserved.</p>
      </div>
    </footer>
  )
}
