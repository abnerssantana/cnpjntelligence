"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Users, Building } from "lucide-react"

interface CNAEAnalysisProps {
  filters: any
}

export function CNAEAnalysis({ filters }: CNAEAnalysisProps) {
  const [cnaeData, setCNAEData] = useState([])
  const [competitorData, setCompetitorData] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockCNAEData = [
    { cnae: "4711302", descricao: "Comércio varejista de mercadorias em geral", count: 1234, percentage: 25.5 },
    { cnae: "6201501", descricao: "Desenvolvimento de programas de computador", count: 987, percentage: 20.4 },
    { cnae: "7020400", descricao: "Atividades de consultoria em gestão", count: 756, percentage: 15.6 },
    { cnae: "4781400", descricao: "Comércio varejista de artigos do vestuário", count: 543, percentage: 11.2 },
    { cnae: "5611201", descricao: "Restaurantes e similares", count: 432, percentage: 8.9 },
  ]

  const mockCompetitorData = [
    { name: "Concorrentes Diretos", value: 45, color: "#ef4444" },
    { name: "Concorrentes Indiretos", value: 30, color: "#f97316" },
    { name: "Complementares", value: 25, color: "#22c55e" },
  ]

  useEffect(() => {
    loadCNAEAnalysis()
  }, [filters])

  const loadCNAEAnalysis = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCNAEData(mockCNAEData)
      setCompetitorData(mockCompetitorData)
    } catch (error) {
      console.error("Error loading CNAE analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const findSimilarCNAEs = async (cnae: string) => {
    // This would find companies with similar CNAEs for competitor analysis
    console.log("Finding similar CNAEs for:", cnae)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CNAEs Únicos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Diferentes atividades econômicas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concorrentes Diretos</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1,847</div>
            <p className="text-xs text-muted-foreground">Empresas com CNAE similar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento do Setor</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.5%</div>
            <p className="text-xs text-muted-foreground">Crescimento no último ano</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top CNAEs por Quantidade</CardTitle>
            <CardDescription>Atividades econômicas mais comuns na região</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Quantidade",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cnaeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cnae" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise de Concorrência</CardTitle>
            <CardDescription>Distribuição de empresas por tipo de concorrência</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Percentual",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={competitorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {competitorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por CNAE</CardTitle>
          <CardDescription>Análise detalhada das principais atividades econômicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cnaeData.map((cnae: any, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{cnae.cnae}</Badge>
                    <span className="font-medium">{cnae.descricao}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {cnae.count} empresas ({cnae.percentage}%)
                    </span>
                    <Progress value={cnae.percentage} className="w-32" />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => findSimilarCNAEs(cnae.cnae)}>
                  Analisar Concorrentes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
