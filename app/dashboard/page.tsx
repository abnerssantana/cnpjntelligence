import { Suspense } from "react"
import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"
import { DashboardContent } from "@/components/dashboard-content"
import { DashboardFilters, getDashboardData } from "./actions"

export const metadata: Metadata = {
  title: 'Dashboard | CNPJ Analytics',
  description: 'Análise completa de dados empresariais do Brasil',
}

interface DashboardPageProps {
  searchParams: DashboardFilters
}

export default async function Dashboard({ searchParams }: DashboardPageProps) {
  // Parse search params with defaults
  const filters: DashboardFilters = {
    uf: searchParams.uf || "",
    municipio: searchParams.municipio || "",
    porte: searchParams.porte || "",
    situacao: searchParams.situacao || "",
    cnae: searchParams.cnae || "",
    natureza_juridica: searchParams.natureza_juridica || "",
    cnpj: searchParams.cnpj || "",
    search: searchParams.search || "",
    page: Number(searchParams.page) || 1,
    limit: Number(searchParams.limit) || 50
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">CNPJ Analytics</h1>
            </div>
            <Badge variant="secondary">Plano Anual - R$ 89/ano</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent filters={filters} />
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
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
