"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TreePine, Users, Network, Search, ExternalLink } from "lucide-react"

interface PartnersAnalysisProps {
  filters: any
}

export function PartnersAnalysis({ filters }: PartnersAnalysisProps) {
  const [searchCPF, setSearchCPF] = useState("")
  const [partnerNetworks, setPartnerNetworks] = useState([])
  const [commonPartners, setCommonPartners] = useState([])
  const [partnerStats, setPartnerStats] = useState({})
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockPartnerNetworks = [
    {
      cpf: "123.456.789-01",
      nome: "João Silva Santos",
      empresas: 5,
      totalCapital: 2500000,
      setores: ["Tecnologia", "Consultoria", "Comércio"],
      risco: "Baixo",
    },
    {
      cpf: "987.654.321-09",
      nome: "Maria Oliveira Costa",
      empresas: 3,
      totalCapital: 1800000,
      setores: ["Saúde", "Educação"],
      risco: "Médio",
    },
    {
      cpf: "456.789.123-45",
      nome: "Carlos Eduardo Lima",
      empresas: 8,
      totalCapital: 4200000,
      setores: ["Construção", "Imobiliário", "Logística"],
      risco: "Alto",
    },
  ]

  const mockCommonPartners = [
    {
      empresa1: "Tech Solutions LTDA",
      cnpj1: "12.345.678/0001-90",
      empresa2: "Digital Services LTDA",
      cnpj2: "98.765.432/0001-10",
      sociosComuns: 2,
      socios: ["João Silva Santos", "Ana Paula Rocha"],
      relacao: "Grupo Empresarial",
    },
    {
      empresa1: "Consultoria ABC LTDA",
      cnpj1: "11.222.333/0001-44",
      empresa2: "Serviços XYZ LTDA",
      cnpj2: "55.666.777/0001-88",
      sociosComuns: 1,
      socios: ["Maria Oliveira Costa"],
      relacao: "Sócio em Comum",
    },
  ]

  const mockPartnerStats = {
    totalPartners: 15847,
    multipleCompanies: 3421,
    averageCompaniesPerPartner: 1.8,
    topPartnerCompanies: 12,
  }

  useEffect(() => {
    loadPartnersAnalysis()
  }, [filters])

  const loadPartnersAnalysis = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPartnerNetworks(mockPartnerNetworks)
      setCommonPartners(mockCommonPartners)
      setPartnerStats(mockPartnerStats)
    } catch (error) {
      console.error("Error loading partners analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchPartnerByCPF = async () => {
    if (!searchCPF) return
    setLoading(true)
    try {
      // Simulate API call to search partner by CPF
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log("Searching partner:", searchCPF)
    } catch (error) {
      console.error("Error searching partner:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiscoColor = (risco: string) => {
    const colors = {
      Baixo: "default",
      Médio: "secondary",
      Alto: "destructive",
    }
    return colors[risco as keyof typeof colors] || "outline"
  }

  const formatCurrency = (value: number) => {
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
      <div>
        <h2 className="text-2xl font-bold">Análise de Sócios</h2>
        <p className="text-muted-foreground">Identificação de redes empresariais e sócios em comum</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sócios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerStats.totalPartners?.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">Sócios únicos identificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Múltiplas Empresas</CardTitle>
            <Network className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {partnerStats.multipleCompanies?.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">Sócios com 2+ empresas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Sócio</CardTitle>
            <TreePine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{partnerStats.averageCompaniesPerPartner}</div>
            <p className="text-xs text-muted-foreground">Empresas por sócio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Rede</CardTitle>
            <Network className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{partnerStats.topPartnerCompanies}</div>
            <p className="text-xs text-muted-foreground">Empresas do maior investidor</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Busca por CPF</CardTitle>
          <CardDescription>Pesquise um sócio específico para ver suas empresas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o CPF (000.000.000-00)"
              value={searchCPF}
              onChange={(e) => setSearchCPF(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={searchPartnerByCPF} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Principais Redes Empresariais</CardTitle>
          <CardDescription>Sócios com maior número de empresas e capital investido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partnerNetworks.map((partner: any, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{partner.nome}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{partner.cpf}</p>
                  </div>
                  <Badge variant={getRiscoColor(partner.risco) as any}>Risco {partner.risco}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Empresas</p>
                    <p className="text-2xl font-bold text-blue-600">{partner.empresas}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Capital Total</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(partner.totalCapital)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Setores</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {partner.setores.map((setor: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {setor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empresas com Sócios em Comum</CardTitle>
          <CardDescription>Identificação de possíveis grupos empresariais</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa 1</TableHead>
                <TableHead>Empresa 2</TableHead>
                <TableHead>Sócios Comuns</TableHead>
                <TableHead>Nomes dos Sócios</TableHead>
                <TableHead>Tipo de Relação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commonPartners.map((relation: any, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{relation.empresa1}</p>
                      <p className="text-xs text-muted-foreground font-mono">{relation.cnpj1}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{relation.empresa2}</p>
                      <p className="text-xs text-muted-foreground font-mono">{relation.cnpj2}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{relation.sociosComuns}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {relation.socios.map((socio: string, i: number) => (
                        <p key={i} className="text-sm">
                          {socio}
                        </p>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{relation.relacao}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Insights de Sócios</CardTitle>
            <CardDescription>Principais descobertas da análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Concentração de Poder</p>
                  <p className="text-sm text-muted-foreground">Top 100 sócios controlam 23% do capital total</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Grupos Empresariais</p>
                  <p className="text-sm text-muted-foreground">Identificados 847 possíveis grupos com sócios comuns</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Diversificação</p>
                  <p className="text-sm text-muted-foreground">
                    Sócios com múltiplas empresas tendem a diversificar setores
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de Compliance</CardTitle>
            <CardDescription>Situações que merecem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-900">Alto Risco</span>
                </div>
                <p className="text-sm text-red-700">23 sócios com mais de 10 empresas cada</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-orange-900">Atenção</span>
                </div>
                <p className="text-sm text-orange-700">156 empresas com mesmo endereço e sócios comuns</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-yellow-900">Monitoramento</span>
                </div>
                <p className="text-sm text-yellow-700">89 sócios com empresas em setores não relacionados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
