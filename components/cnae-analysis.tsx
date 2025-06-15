'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Building2 } from "lucide-react"
import { supabaseServer } from "@/lib/supabaseServer"

interface CNAEAnalysisProps {
  filters: any
}

export function CNAEAnalysis({ filters }: CNAEAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    topCNAEs: [],
    cnaeBySize: [],
    cnaeGrowth: []
  })

  useEffect(() => {
    loadCNAEData()
  }, [filters])

  const loadCNAEData = async () => {
    try {
      setLoading(true)
      // This would be replaced with a server action in production
      // For now, showing the structure
      setData({
        topCNAEs: [
          { cnae: '4711302', description: 'Comércio varejista', count: 15234, percentage: 28.5 },
          { cnae: '6201501', description: 'Desenvolvimento de software', count: 8932, percentage: 16.7 },
          { cnae: '7020400', description: 'Consultoria empresarial', count: 7654, percentage: 14.3 },
          { cnae: '5611203', description: 'Restaurantes', count: 6543, percentage: 12.2 },
          { cnae: '8599604', description: 'Treinamento', count: 4321, percentage: 8.1 }
        ],
        cnaeBySize: [
          { size: 'Microempresa', cnaes: [
            { cnae: '4711302', count: 12000 },
            { cnae: '6201501', count: 7000 }
          ]},
          { size: 'Pequeno Porte', cnaes: [
            { cnae: '4711302', count: 3000 },
            { cnae: '7020400', count: 2500 }
          ]}
        ],
        cnaeGrowth: [
          { cnae: '6201501', description: 'Desenvolvimento de software', growth: 45.2 },
          { cnae: '8599604', description: 'Treinamento', growth: 38.7 },
          { cnae: '7020400', description: 'Consultoria', growth: 22.1 }
        ]
      })
    } catch (error) {
      console.error('Error loading CNAE data:', error)
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
      {/* Top CNAEs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            CNAEs Mais Comuns
          </CardTitle>
          <CardDescription>
            Principais atividades econômicas das empresas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCNAEs.map((item: any, index: number) => (
              <div key={item.cnae} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{item.cnae}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{item.count.toLocaleString('pt-BR')}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{item.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CNAE by Company Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            CNAEs por Porte de Empresa
          </CardTitle>
          <CardDescription>
            Distribuição de atividades por tamanho da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.cnaeBySize.map((sizeGroup: any) => (
              <div key={sizeGroup.size}>
                <h4 className="font-medium mb-3">{sizeGroup.size}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sizeGroup.cnaes.map((cnae: any) => (
                    <div key={cnae.cnae} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{cnae.cnae}</span>
                      <Badge variant="outline">{cnae.count.toLocaleString('pt-BR')}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fastest Growing CNAEs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            CNAEs em Crescimento
          </CardTitle>
          <CardDescription>
            Atividades com maior crescimento no último ano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.cnaeGrowth.map((item: any) => (
              <div key={item.cnae} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.cnae}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">+{item.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}