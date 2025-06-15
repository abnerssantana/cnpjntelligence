"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { MapPin, TrendingUp, Building2 } from "lucide-react"

interface GeographicAnalysisProps {
  filters: any
}

export function GeographicAnalysis({ filters }: GeographicAnalysisProps) {
  const [stateData, setStateData] = useState([])
  const [cityData, setCityData] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockStateData = [
    { uf: "SP", name: "São Paulo", count: 2456789, percentage: 35.2 },
    { uf: "RJ", name: "Rio de Janeiro", count: 1234567, percentage: 17.7 },
    { uf: "MG", name: "Minas Gerais", count: 987654, percentage: 14.1 },
    { uf: "RS", name: "Rio Grande do Sul", count: 765432, percentage: 11.0 },
    { uf: "PR", name: "Paraná", count: 543210, percentage: 7.8 },
  ]

  const mockCityData = [
    { city: "São Paulo", uf: "SP", count: 456789, growth: 12.5 },
    { city: "Rio de Janeiro", uf: "RJ", count: 234567, growth: 8.3 },
    { city: "Belo Horizonte", uf: "MG", count: 187654, growth: 15.2 },
    { city: "Porto Alegre", uf: "RS", count: 165432, growth: 6.7 },
    { city: "Curitiba", uf: "PR", count: 143210, growth: 18.9 },
  ]

  useEffect(() => {
    loadGeographicAnalysis()
  }, [filters])

  const loadGeographicAnalysis = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStateData(mockStateData)
      setCityData(mockCityData)
    } catch (error) {
      console.error("Error loading geographic analysis:", error)
    } finally {
      setLoading(false)
    }
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
            <CardTitle className="text-sm font-medium">Estados Ativos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">Estados com empresas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Municípios</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,570</div>
            <p className="text-xs text-muted-foreground">Municípios com empresas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concentração</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">65%</div>
            <p className="text-xs text-muted-foreground">Concentradas no Sudeste</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Empresas por Estado</CardTitle>
            <CardDescription>Distribuição geográfica por unidade federativa</CardDescription>
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
                <BarChart data={stateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="uf" />
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
            <CardTitle>Crescimento por Cidade</CardTitle>
            <CardDescription>Taxa de crescimento de empresas nas principais cidades</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                growth: {
                  label: "Crescimento (%)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="growth" fill="var(--color-growth)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ranking por Estado</CardTitle>
            <CardDescription>Estados com maior número de empresas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stateData.map((state: any, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <span className="font-medium">{state.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat("pt-BR").format(state.count)} empresas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{state.percentage}%</span>
                    <Progress value={state.percentage} className="w-20 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principais Cidades</CardTitle>
            <CardDescription>Cidades com maior concentração de empresas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityData.map((city: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{city.city}</span>
                      <Badge variant="secondary">{city.uf}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat("pt-BR").format(city.count)} empresas
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${city.growth > 10 ? "text-green-600" : "text-blue-600"}`}>
                      +{city.growth}%
                    </span>
                    <p className="text-xs text-muted-foreground">crescimento</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
