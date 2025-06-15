'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CompanyFilters } from "@/components/company-filters"
import { KPICards } from "@/components/kpi-cards"
import { CompanyTable } from "@/components/company-table"
import { CNAEAnalysis } from "@/components/cnae-analysis"
import { GeographicAnalysis } from "@/components/geographic-analysis"
import { TemporalAnalysis } from "@/components/temporal-analysis"
import { PartnersAnalysis } from "@/components/partners-analysis"
import { CapitalAnalysis } from "@/components/capital-analysis"
import { DashboardFilters, getDashboardData } from "@/app/dashboard/actions"
import { useEffect } from "react"

interface DashboardContentProps {
  filters: DashboardFilters
}

export function DashboardContent({ filters: initialFilters }: DashboardContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState(initialFilters)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await getDashboardData(filters)
      setData(result)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    
    // Reset page when filters change
    if (key !== 'page') {
      newFilters.page = 1
    }
    
    // Reset municipality when state changes
    if (key === 'uf') {
      newFilters.municipio = ''
    }

    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleSearch = () => {
    startTransition(() => {
      loadData()
    })
  }

  const updateURL = (newFilters: DashboardFilters) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString())
      }
    })

    router.push(`/dashboard?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    handleFilterChange('page', page.toString())
    handleSearch()
  }

  if (!data && loading) {
    return <DashboardSkeleton />
  }

  const { companies, kpis, totalCount, currentPage, totalPages } = data || {
    companies: [],
    kpis: { totalCompanies: 0, activeCompanies: 0, newCompanies: 0, closedCompanies: 0 },
    totalCount: 0,
    currentPage: 1,
    totalPages: 1
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="companies">Empresas</TabsTrigger>
        <TabsTrigger value="cnae">Análise CNAE</TabsTrigger>
        <TabsTrigger value="geographic">Análise Geográfica</TabsTrigger>
        <TabsTrigger value="temporal">Análise Temporal</TabsTrigger>
        <TabsTrigger value="partners">Análise de Sócios</TabsTrigger>
        <TabsTrigger value="capital">Análise de Capital</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <CompanyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          loading={isPending || loading}
        />

        <KPICards kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Empresas por Porte</CardTitle>
              <CardDescription>Distribuição por tamanho da empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanySizeChart companies={companies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top CNAEs</CardTitle>
              <CardDescription>Atividades econômicas mais comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <TopCNAEs companies={companies} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Empresas Recentes</CardTitle>
            <CardDescription>Últimas empresas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyTable 
              companies={companies.slice(0, 10)} 
              loading={loading}
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalCount: 10,
                onPageChange: () => {}
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="companies">
        <CompanyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          loading={isPending || loading}
        />
        
        <CompanyTable 
          companies={companies} 
          loading={loading}
          pagination={{
            currentPage,
            totalPages,
            totalCount,
            onPageChange: handlePageChange
          }}
        />
      </TabsContent>

      <TabsContent value="cnae">
        <CNAEAnalysis filters={filters} />
      </TabsContent>

      <TabsContent value="geographic">
        <GeographicAnalysis filters={filters} />
      </TabsContent>

      <TabsContent value="temporal">
        <TemporalAnalysis filters={filters} />
      </TabsContent>

      <TabsContent value="partners">
        <PartnersAnalysis filters={filters} />
      </TabsContent>

      <TabsContent value="capital">
        <CapitalAnalysis filters={filters} />
      </TabsContent>
    </Tabs>
  )
}

function CompanySizeChart({ companies }: { companies: any[] }) {
  const sizes = {
    '1': { label: 'Microempresa', count: 0 },
    '3': { label: 'Pequeno Porte', count: 0 },
    '5': { label: 'Demais', count: 0 }
  }

  companies.forEach(company => {
    const porte = company.companies?.porte_empresa
    if (porte && sizes[porte]) {
      sizes[porte].count++
    }
  })

  const total = Object.values(sizes).reduce((sum, size) => sum + size.count, 0)

  return (
    <div className="space-y-4">
      {Object.entries(sizes).map(([key, size]) => {
        const percentage = total > 0 ? (size.count / total) * 100 : 0
        return (
          <div key={key} className="space-y-2">
            <div className="flex justify-between">
              <span>{size.label}</span>
              <span className="font-semibold">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TopCNAEs({ companies }: { companies: any[] }) {
  const cnaeCount: Record<string, { count: number; description: string }> = {}

  companies.forEach(company => {
    const cnae = company.cnae_fiscal_principal
    const description = company.cnaes?.descricao || 'Não especificado'
    
    if (cnae) {
      if (!cnaeCount[cnae]) {
        cnaeCount[cnae] = { count: 0, description }
      }
      cnaeCount[cnae].count++
    }
  })

  const topCNAEs = Object.entries(cnaeCount)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-3">
      {topCNAEs.map(([cnae, data]) => (
        <div key={cnae} className="flex justify-between items-center">
          <div className="flex-1">
            <span className="text-sm font-medium">{cnae}</span>
            <p className="text-xs text-gray-600 truncate">{data.description}</p>
          </div>
          <Badge variant="secondary">{data.count}</Badge>
        </div>
      ))}
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