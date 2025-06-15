import { Suspense } from "react"
import { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Loader2 } from "lucide-react"
import { DashboardSimple } from "@/components/dashboard-simple"

export const metadata: Metadata = {
  title: 'Dashboard | CNPJntelligence',
  description: 'Consulta e análise de dados empresariais',
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CNPJntelligence</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardSimple />
        </Suspense>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}