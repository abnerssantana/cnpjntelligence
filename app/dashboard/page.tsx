"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"
import { CompanyFilters } from "@/components/company-filters"
import { KPICards } from "@/components/kpi-cards"
import { CompanyTable } from "@/components/company-table"
import { CNAEAnalysis } from "@/components/cnae-analysis"
import { GeographicAnalysis } from "@/components/geographic-analysis"
import { TemporalAnalysis } from "@/components/temporal-analysis"
import { PartnersAnalysis } from "@/components/partners-analysis"
import { CapitalAnalysis } from "@/components/capital-analysis"

export default function Dashboard() {
  const [filters, setFilters] = useState({
    uf: "",
    municipio: "",
    porte: "",
    situacao: "",
    cnae: "",
    natureza_juridica: "",
  })

  const [kpis, setKPIs] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    newCompanies: 0,
    closedCompanies: 0,
  })

  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const searchCompanies = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/companies/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      })
      const data = await response.json()
      setCompanies(data.companies)
      setKPIs(data.kpis)
    } catch (error) {
      console.error("Error searching companies:", error)
    } finally {
      setLoading(false)
    }
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
              onSearch={searchCompanies}
              loading={loading}
            />

            <KPICards kpis={kpis} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Empresas por Porte</CardTitle>
                  <CardDescription>Distribuição por tamanho da empresa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Micro Empresa</span>
                      <span className="font-semibold">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top CNAEs</CardTitle>
                  <CardDescription>Atividades econômicas mais comuns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Comércio Varejista</span>
                      <Badge variant="secondary">1,234</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Serviços de TI</span>
                      <Badge variant="secondary">987</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Consultoria</span>
                      <Badge variant="secondary">756</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <CompanyTable companies={companies} loading={loading} />
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
      </div>
    </div>
  )
}
