'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, TrendingDown, Activity } from "lucide-react"

interface TemporalAnalysisProps {
  filters: any
}

export function TemporalAnalysis({ filters }: TemporalAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    monthlyTrend: [],
    yearlyComparison: [],
    seasonality: []
  })

  useEffect(() => {
    loadTemporalData()
  }, [filters])

  const loadTemporalData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with server action
      setData({
        monthlyTrend: [
          { month: 'Jan/24', opened: 12345, closed: 2345, net: 10000 },
          { month: 'Fev/24', opened: 13456, closed: 2456, net: 11000 },
          { month: 'Mar/24', opened: 14567, closed: 2567, net: 12000 },
          { month: 'Abr/24', opened: 15678, closed: 2678, net: 13000 },
          { month: 'Mai/24', opened: 16789, closed: 2789, net: 14000 },
          { month: 'Jun/24', opened: 17890, closed: 2890, net: 15000 }
        ],
        yearlyComparison: [
          { year: 2020, total: 4567890, growth: 0 },
          { year: 2021, total: 5234567, growth: 14.6 },
          { year: 2022, total: 5987654, growth: 14.4 },
          { year: 2023, total: 6789012, growth: 13.4 },
          { year: 2024, total: 7654321, growth: 12.7 }
        ],
        seasonality: [
          { quarter: 'Q1', average: 45678, description: 'Início do ano fiscal' },
          { quarter: 'Q2', average: 52345, description: 'Período de maior abertura' },
          { quarter: 'Q3', average: 48765, description: 'Estável' },
          { quarter: 'Q4', average: 41234, description: 'Final de ano' }
        ]
      })
    } catch (error) {
      console.error('Error loading temporal data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tendência Mensal
          </CardTitle>
          <CardDescription>
            Abertura e fechamento de empresas por mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyTrend.map((month: any) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        +{month.opened.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">
                        -{month.closed.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      Saldo: {month.net.toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  <div 
                    className="bg-green-500 rounded-l" 
                    style={{ width: `${(month.opened / (month.opened + month.closed)) * 100}%` }}
                  />
                  <div 
                    className="bg-red-500 rounded-r" 
                    style={{ width: `${(month.closed / (month.opened + month.closed)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Yearly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Comparação Anual
            </CardTitle>
            <CardDescription>
              Evolução do número total de empresas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.yearlyComparison.map((year: any) => (
                <div key={year.year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{year.year}</p>
                    <p className="text-sm text-muted-foreground">
                      {year.total.toLocaleString('pt-BR')} empresas
                    </p>
                  </div>
                  {year.growth > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">+{year.growth}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seasonality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sazonalidade
            </CardTitle>
            <CardDescription>
              Padrões de abertura por trimestre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.seasonality.map((quarter: any) => (
                <div key={quarter.quarter} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{quarter.quarter}</p>
                    <Badge variant="outline">
                      Média: {quarter.average.toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{quarter.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}