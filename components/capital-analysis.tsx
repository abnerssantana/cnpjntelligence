"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, TrendingUp, PieChartIcon, BarChart3 } from "lucide-react"

interface CapitalAnalysisProps {
  filters: any
}

export function CapitalAnalysis({ filters }: CapitalAnalysisProps) {
  const [analysisType, setAnalysisType] = useState("distribution")
  const [capitalDistribution, setCapitalDistribution] = useState([])
  const [sectorCapital, setSectorCapital] = useState([])
  const [capitalEvolution, setCapitalEvolution] = useState([])
  const [capitalStats, setCapitalStats] = useState({})
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockCapitalDistribution = [
    { faixa: "Até R$ 10k", count: 45678, percentage: 65.2, totalCapital: 234567890 },
    { faixa: "R$ 10k - R$ 100k", count: 15432, percentage: 22.0, totalCapital: 567890123 },
    { faixa: "R$ 100k - R$ 1M", count: 6789, percentage: 9.7, totalCapital: 2345678901 },
    { faixa: "R$ 1M - R$ 10M", count: 1876, percentage: 2.7, totalCapital: 8901234567 },
    { faixa: "R$ 10M+", count: 298, percentage: 0.4, totalCapital: 15678901234 },
  ]

  const mockSectorCapital = [
    { setor: "Tecnologia", avgCapital: 850000, medianCapital: 250000, companies: 1234, color: "#3b82f6" },
    { setor: "Saúde", avgCapital: 1200000, medianCapital: 400000, companies: 987, color: "#ef4444" },
    { setor: "Educação", avgCapital: 320000, medianCapital: 150000, companies: 756, color: "#22c55e" },
    { setor: "Comércio", avgCapital: 180000, medianCapital: 80000, companies: 2345, color: "#f59e0b" },
    { setor: "Serviços", avgCapital: 95000, medianCapital: 45000, companies: 3456, color: "#8b5cf6" },
  ]

  const mockCapitalEvolution = [
    { year: "2019", avgCapital: 145000, totalCapital: 12500000000 },
    { year: "2020", avgCapital: 132000, totalCapital: 11800000000 },
    { year: "2021", avgCapital: 156000, totalCapital: 14200000000 },
    { year: "2022", avgCapital: 178000, totalCapital: 16800000000 },
    { year: "2023", avgCapital: 195000, totalCapital: 18900000000 },
  ]

  const mockCapitalStats = {
    totalCapital: 189000000000,
    averageCapital: 195000,
    medianCapital: 50000,
    companiesWithCapital: 97.3,
    topCompanyCapital: 500000000,
  }

  useEffect(() => {
    loadCapitalAnalysis()
  }, [filters, analysisType])

  const loadCapitalAnalysis = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCapitalDistribution(mockCapitalDistribution)
      setSectorCapital(mockSectorCapital)
      setCapitalEvolution(mockCapitalEvolution)
      setCapitalStats(mockCapitalStats)
    } catch (error) {
      console.error("Error loading capital analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `R$ ${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise de Capital Social</h2>
          <p className="text-muted-foreground">Distribuição e análise do capital investido nas empresas</p>
        </div>
        <Select value={analysisType} onValueChange={setAnalysisType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distribution">Distribuição</SelectItem>
            <SelectItem value="sectors">Por Setor</SelectItem>
            <SelectItem value="evolution">Evolução</SelectItem>
            <SelectItem value="comparison">Comparação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(capitalStats.totalCapital)}</div>
            <p className="text-xs text-muted-foreground">Soma de todo capital social</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(capitalStats.averageCapital)}</div>
            <p className="text-xs text-muted-foreground">Média por empresa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Mediano</CardTitle>
            <PieChartIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(capitalStats.medianCapital)}</div>
            <p className="text-xs text-muted-foreground">Valor mediano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Capital</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{capitalStats.companiesWithCapital}%</div>
            <p className="text-xs text-muted-foreground">Empresas com capital informado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Capital</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(capitalStats.topCompanyCapital)}</div>
            <p className="text-xs text-muted-foreground">Maior capital individual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Faixa de Capital</CardTitle>
            <CardDescription>Quantidade de empresas por faixa de capital social</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Empresas", color: "hsl(var(--chart-1))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capitalDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" />
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
            <CardTitle>Capital por Setor</CardTitle>
            <CardDescription>Capital médio e mediano por setor econômico</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                avgCapital: { label: "Capital Médio", color: "hsl(var(--chart-1))" },
                medianCapital: { label: "Capital Mediano", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorCapital}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="setor" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgCapital" fill="var(--color-avgCapital)" />
                  <Bar dataKey="medianCapital" fill="var(--color-medianCapital)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Faixa de Capital</CardTitle>
          <CardDescription>Análise detalhada da distribuição de capital</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capitalDistribution.map((faixa: any, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{faixa.faixa}</h3>
                    <p className="text-sm text-muted-foreground">
                      {faixa.count.toLocaleString("pt-BR")} empresas ({faixa.percentage}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(faixa.totalCapital)}</p>
                    <p className="text-sm text-muted-foreground">Capital total</p>
                  </div>
                </div>
                <Progress value={faixa.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Capital</CardTitle>
            <CardDescription>Crescimento do capital social ao longo dos anos</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                avgCapital: { label: "Capital Médio", color: "hsl(var(--chart-1))" },
                totalCapital: { label: "Capital Total", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capitalEvolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgCapital" fill="var(--color-avgCapital)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights de Capital</CardTitle>
            <CardDescription>Principais descobertas da análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Concentração</p>
                  <p className="text-sm text-muted-foreground">65% das empresas têm capital até R$ 10k</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Setor Premium</p>
                  <p className="text-sm text-muted-foreground">Saúde tem o maior capital médio (R$ 1.2M)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Crescimento</p>
                  <p className="text-sm text-muted-foreground">Capital médio cresceu 34% nos últimos 4 anos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Oportunidade</p>
                  <p className="text-sm text-muted-foreground">Tecnologia: alto potencial, capital moderado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Setores por Capital</CardTitle>
          <CardDescription>Setores ordenados por capital médio investido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sectorCapital
              .sort((a, b) => b.avgCapital - a.avgCapital)
              .map((sector: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <span className="font-medium">{sector.setor}</span>
                      <p className="text-sm text-muted-foreground">
                        {sector.companies.toLocaleString("pt-BR")} empresas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(sector.avgCapital)}</p>
                    <p className="text-sm text-muted-foreground">Mediano: {formatCurrency(sector.medianCapital)}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
