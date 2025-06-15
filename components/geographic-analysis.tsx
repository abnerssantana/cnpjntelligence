'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building2, TrendingUp } from "lucide-react"

interface GeographicAnalysisProps {
  filters: any
}

export function GeographicAnalysis({ filters }: GeographicAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    stateDistribution: [],
    topCities: [],
    regionGrowth: []
  })

  useEffect(() => {
    loadGeographicData()
  }, [filters])

  const loadGeographicData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with server action
      setData({
        stateDistribution: [
          { state: 'SP', name: 'São Paulo', count: 2543876, percentage: 35.2 },
          { state: 'RJ', name: 'Rio de Janeiro', count: 987654, percentage: 13.7 },
          { state: 'MG', name: 'Minas Gerais', count: 876543, percentage: 12.1 },
          { state: 'RS', name: 'Rio Grande do Sul', count: 654321, percentage: 9.1 },
          { state: 'PR', name: 'Paraná', count: 543210, percentage: 7.5 }
        ],
        topCities: [
          { city: 'São Paulo', state: 'SP', count: 987654 },
          { city: 'Rio de Janeiro', state: 'RJ', count: 543210 },
          { city: 'Belo Horizonte', state: 'MG', count: 234567 },
          { city: 'Porto Alegre', state: 'RS', count: 198765 },
          { city: 'Curitiba', state: 'PR', count: 176543 }
        ],
        regionGrowth: [
          { region: 'Sudeste', growth: 12.5, newCompanies: 45678 },
          { region: 'Sul', growth: 15.3, newCompanies: 34567 },
          { region: 'Nordeste', growth: 18.7, newCompanies: 23456 },
          { region: 'Centro-Oeste', growth: 22.1, newCompanies: 12345 },
          { region: 'Norte', growth: 25.4, newCompanies: 8765 }
        ]
      })
    } catch (error) {
      console.error('Error loading geographic data:', error)
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
      {/* State Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Distribuição por Estado
          </CardTitle>
          <CardDescription>
            Concentração de empresas por unidade federativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stateDistribution.map((state: any) => (
              <div key={state.state} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-600">{state.state}</span>
                    </div>
                    <div>
                      <p className="font-medium">{state.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {state.count.toLocaleString('pt-BR')} empresas
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{state.percentage}%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${state.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Principais Cidades
            </CardTitle>
            <CardDescription>
              Cidades com maior número de empresas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCities.map((city: any, index: number) => (
                <div key={city.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{city.city}</p>
                      <p className="text-sm text-muted-foreground">{city.state}</p>
                    </div>
                  </div>
                  <Badge>{city.count.toLocaleString('pt-BR')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Crescimento por Região
            </CardTitle>
            <CardDescription>
              Taxa de crescimento no último ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.regionGrowth.map((region: any) => (
                <div key={region.region} className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{region.region}</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">+{region.growth}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {region.newCompanies.toLocaleString('pt-BR')} novas empresas
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}