import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-emerald-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-emerald-100 rounded animate-pulse w-1/3"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-emerald-200">
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-emerald-100 rounded mb-2"></div>
                <div className="h-8 bg-emerald-200 rounded"></div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border-emerald-200">
              <CardContent className="p-6">
                <div className="h-64 bg-emerald-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
