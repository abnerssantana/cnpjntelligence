"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar, TrendingUp, Clock, AlertTriangle } from "lucide-react"

interface TemporalAnalysisProps {
  filters: any
}

export function TemporalAnalysis({ filters }: TemporalAnalysisProps) {
  const [timeRange, setTimeRange] = useState("12months")
  const [evolutionData, setEvolutionData] = useState([])
  const [ageData, setAgeData] = useState([])
  const [seasonalData, setSeasonalData] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockEvolutionData = [
    { month: "Jan 2023", abertas: 1234, fechadas: 456, liquido: 778 },
    { month: "Fev 2023", abertas: 1456, fechadas: 523, liquido: 933 },
    { month: "Mar 2023", abertas: 1678, fechadas: 434, liquido: 1244 },
    { month: "Abr 2023", abertas: 1543, fechadas: 567, liquido: 976 },
    { month: "Mai 2023", abertas: 1789, fechadas: 445, liquido: 1344 },
    { month: "Jun 2023", abertas: 1654, fechadas: 678, liquido: 976 },
    { month: "Jul 2023", abertas: 1876, fechadas: 534, liquido: 1342 },
    { month: "Ago 2023", abertas: 1765, fechadas: 623, liquido: 1142 },
    { month: "Set 2023", abertas: 1987, fechadas: 456, liquido: 1531 },
    { month: "Out 2023", abertas: 1834, fechadas: 567, liquido: 1267 },
    { month: "Nov 2023", abertas: 1723, fechadas: 678, liquido: 1045 },
    { month: "Dez 2023", abertas: 1456, fechadas: 789, liquido: 667 },
  ]

  const mockAgeData = [
    { faixa: "0-1 anos", count: 15234, percentage: 18.5, risco: "Alto" },
    { faixa: "1-3 anos", count: 12456, percentage: 15.1, risco: "Médio-Alto" },
    { faixa: "3-5 anos", count: 10987, percentage: 13.3, risco: "Médio" },
    { faixa: "5-10 anos", count: 18765, percentage: 22.8, risco: "Baixo" },
    { faixa: "10-20 anos", count: 14532, percentage: 17.6, risco: "Muito Baixo" },
    { faixa: "20+ anos", count: 10234, percentage: 12.4, risco: "Muito Baixo" },
  ]

  const mockSeasonalData = [
    { mes: "Janeiro", media: 1456, atual: 1234, variacao: -15.2 },
    { mes: "Fevereiro", media: 1234, atual: 1456, variacao: 18.0 },
    { mes: "Março", media: 1567, atual: 1678, variacao: 7.1 },
    { mes: "Abril", media: 1345, atual: 1543, variacao: 14.7 },
    { mes: "Maio", media: 1678, atual: 1789, variacao: 6.6 },
    { mes: "Junho", media: 1543, atual: 1654, variacao: 7.2 },
  ]

  useEffect(() => {
    loadTemporalAnalysis()
  }, [filters, timeRange])

  const loadTemporalAnalysis = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setEvolutionData(mockEvolutionData)
      setAgeData(mockAgeData)
      setSeasonalData(mockSeasonalData)
    } catch (error) {
      console.error("Error loading temporal analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiscoColor = (risco: string) => {
    const colors = {
      Alto: "destructive",
      "Médio-Alto": "secondary",
      Médio: "outline",
      Baixo: "default",
      "Muito Baixo": "default",
    }
    return colors[risco as keyof typeof colors] || "outline"
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
          <h2 className="text-2xl font-bold">Análise Temporal</h2>
          <p className="text-muted-foreground">Evolução das empresas ao longo do tempo</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
            <SelectItem value="12months">Últimos 12 meses</SelectItem>
            <SelectItem value="24months">Últimos 24 meses</SelectItem>
            <SelectItem value="5years">Últimos 5 anos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertas (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,456</div>
            <p className="text-xs text-muted-foreground">+12.5% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechadas (Mês)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">789</div>
            <p className="text-xs text-muted-foreground">-5.2% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+667</div>
            <p className="text-xs text-muted-foreground">Crescimento líquido mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sobrevivência</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">78.5%</div>
            <p className="text-xs text-muted-foreground">Empresas ativas após 2 anos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Abertura e fechamento de empresas por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                abertas: { label: "Abertas", color: "hsl(var(--chart-1))" },
                fechadas: { label: "Fechadas", color: "hsl(var(--chart-2))" },
                liquido: { label: "Saldo Líquido", color: "hsl(var(--chart-3))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="abertas" stroke="var(--color-abertas)" strokeWidth={2} />
                  <Line type="monotone" dataKey="fechadas" stroke="var(--color-fechadas)" strokeWidth={2} />
                  <Line type="monotone" dataKey="liquido" stroke="var(--color-liquido)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sazonalidade</CardTitle>
            <CardDescription>Padrões sazonais de abertura de empresas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                media: { label: "Média Histórica", color: "hsl(var(--chart-1))" },
                atual: { label: "Ano Atual", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="media" fill="var(--color-media)" />
                  <Bar dataKey="atual" fill="var(--color-atual)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Idade das Empresas</CardTitle>
          <CardDescription>Distribuição por tempo de mercado e análise de risco</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ageData.map((age: any, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{age.faixa}</span>
                  <Badge variant={getRiscoColor(age.risco) as any}>{age.risco}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Empresas:</span>
                    <span className="font-semibold">{new Intl.NumberFormat("pt-BR").format(age.count)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Percentual:</span>
                    <span className="font-semibold">{age.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${age.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Insights Temporais</CardTitle>
            <CardDescription>Principais descobertas da análise temporal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Crescimento Sustentado</p>
                  <p className="text-sm text-muted-foreground">
                    Saldo líquido positivo nos últimos 8 meses consecutivos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Pico Sazonal</p>
                  <p className="text-sm text-muted-foreground">Março e Setembro apresentam maior volume de aberturas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Taxa de Mortalidade</p>
                  <p className="text-sm text-muted-foreground">21.5% das empresas fecham nos primeiros 2 anos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previsões</CardTitle>
            <CardDescription>Projeções baseadas em dados históricos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Próximo Trimestre</span>
                </div>
                <p className="text-sm text-green-700">
                  Estimativa de +2,340 empresas abertas baseado na tendência atual
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Melhor Período</span>
                </div>
                <p className="text-sm text-blue-700">Março-Abril: período ideal para lançamento de produtos/serviços</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Oportunidade</span>
                </div>
                <p className="text-sm text-purple-700">Empresas com 3-5 anos: momento crítico para expansão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
