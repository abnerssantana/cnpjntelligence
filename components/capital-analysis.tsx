'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, BarChart3, PieChart } from "lucide-react"

interface CapitalAnalysisProps {
  filters: any
}

export function CapitalAnalysis({ filters }: CapitalAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    capitalDistribution: [],
    topCompanies: [],
    sectorCapital: [],
    capitalGrowth: []
  })

  useEffect(() => {
    loadCapitalData()
  }, [filters])

  const loadCapitalData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with server action
      setData({
        capitalDistribution: [
          { range: 'Até R$ 10k', count: 234567, percentage: 45.2 },
          { range: 'R$ 10k - R$ 50k', count: 156789, percentage: 30.3 },
          { range: 'R$ 50k - R$ 100k', count: 67890, percentage: 13.1 },
          { range: 'R$ 100k - R$ 500k', count: 45678, percentage: 8.8 },
          { range: 'R$ 500k - R$ 1M', count: 12345, percentage: 2.4 },
          { range: 'Acima de R$ 1M', count: 1234, percentage: 0.2 }
        ],
        topCompanies: [
          { name: 'Empresa ABC Ltda', capital: 50000000, cnpj: '12.345.678/0001-90' },
          { name: 'Indústria XYZ S.A.', capital: 35000000, cnpj: '98.765.432/0001-10' },
          { name: 'Comércio 123 Eireli', capital: 25000000, cnpj: '11.222.333/0001-44' },
          { name: 'Serviços QWE Ltda', capital: 18000000, cnpj: '55.666.777/0001-88' },
          { name: 'Tecnologia RTY S.A.', capital: 15000000, cnpj: '99.888.777/0001-66' }
        ],
        sectorCapital: [
          { sector: 'Indústria', total: 2500000000, average: 850000 },
          { sector: 'Comércio', total: 1800000000, average: 250000 },
          { sector: 'Serviços', total: 1200000000, average: 180000 },
          { sector: 'Tecnologia', total: 950000000, average: 450000 },
          { sector: 'Construção', total: 750000000, average: 320000 }
        ],
        capitalGrowth: [
          { year: 2020, total: 4500000000, growth: 0 },
          { year: 2021, total: 5200000000, growth: 15.6 },
          { year: 2022, total: 6100000000, growth: 17.3 },
          { year: 2023, total: 7300000000, growth: 19.7 },
          { year: 2024, total: 8500000000, growth: 16.4 }
        ]
      })
    } catch (error) {
      console.error('Error loading capital data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
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
      {/* Capital Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribuição de Capital Social
          </CardTitle>
          <CardDescription>
            Faixas de capital social das empresas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.capitalDistribution.map((range: any) => (
              <div key={range.range} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{range.range}</span>
                  <div className="text-right">
                    <Badge variant="secondary">{range.count.toLocaleString('pt-BR')}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{range.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${range.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Companies by Capital */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Maiores Capitais Sociais
          </CardTitle>
          <CardDescription>
            Empresas com maior capital social registrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topCompanies.map((company: any, index: number) => (
              <div key={company.cnpj} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                  </div>
                </div>
                <Badge variant="default" className="text-base">
                  {formatCurrency(company.capital)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Capital */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Capital por Setor
            </CardTitle>
            <CardDescription>
              Total e média de capital por setor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sectorCapital.map((sector: any) => (
                <div key={sector.sector} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{sector.sector}</p>
                    <Badge variant="outline">{formatCurrency(sector.total)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Média por empresa: {formatCurrency(sector.average)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Capital Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução do Capital Total
            </CardTitle>
            <CardDescription>
              Crescimento anual do capital social total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.capitalGrowth.map((year: any) => (
                <div key={year.year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{year.year}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(year.total)}
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
      </div>
    </div>
  )
}