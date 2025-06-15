'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Building2, Network } from "lucide-react"

interface PartnersAnalysisProps {
  filters: any
}

export function PartnersAnalysis({ filters }: PartnersAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    topPartners: [],
    partnerTypes: [],
    businessGroups: []
  })

  useEffect(() => {
    loadPartnersData()
  }, [filters])

  const loadPartnersData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with server action
      setData({
        topPartners: [
          { name: 'João Silva', cpf: '***.***.***-01', companies: 15, totalCapital: 5000000 },
          { name: 'Maria Santos', cpf: '***.***.***-02', companies: 12, totalCapital: 3500000 },
          { name: 'Pedro Oliveira', cpf: '***.***.***-03', companies: 10, totalCapital: 2800000 },
          { name: 'Ana Costa', cpf: '***.***.***-04', companies: 8, totalCapital: 2200000 },
          { name: 'Carlos Ferreira', cpf: '***.***.***-05', companies: 7, totalCapital: 1900000 }
        ],
        partnerTypes: [
          { type: 'Pessoa Física', count: 234567, percentage: 78.5 },
          { type: 'Pessoa Jurídica', count: 64321, percentage: 21.5 }
        ],
        businessGroups: [
          { 
            groupName: 'Grupo ABC', 
            companies: 25, 
            totalRevenue: 150000000,
            sectors: ['Varejo', 'Tecnologia', 'Serviços']
          },
          { 
            groupName: 'Holding XYZ', 
            companies: 18, 
            totalRevenue: 98000000,
            sectors: ['Indústria', 'Logística']
          },
          { 
            groupName: 'Conglomerado 123', 
            companies: 15, 
            totalRevenue: 75000000,
            sectors: ['Construção', 'Imobiliário']
          }
        ]
      })
    } catch (error) {
      console.error('Error loading partners data:', error)
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
      {/* Top Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Principais Sócios
          </CardTitle>
          <CardDescription>
            Sócios com maior número de empresas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPartners.map((partner: any, index: number) => (
              <div key={partner.cpf} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">CPF: {partner.cpf}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{partner.companies} empresas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Capital: {formatCurrency(partner.totalCapital)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Tipos de Sócios
            </CardTitle>
            <CardDescription>
              Distribuição por tipo de pessoa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.partnerTypes.map((type: any) => (
                <div key={type.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{type.type}</span>
                    <div className="text-right">
                      <Badge variant="secondary">{type.count.toLocaleString('pt-BR')}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{type.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${type.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Grupos Empresariais
            </CardTitle>
            <CardDescription>
              Principais grupos identificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.businessGroups.map((group: any) => (
                <div key={group.groupName} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{group.groupName}</p>
                    <Badge>{group.companies} empresas</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Receita: {formatCurrency(group.totalRevenue)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.sectors.map((sector: string) => (
                      <Badge key={sector} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
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