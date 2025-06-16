"use client"

import React, { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { 
  Building2, TrendingUp, MapPin, Briefcase, DollarSign, Download, BarChart3,
  ShoppingCart, Wrench, Home, Car, Utensils, GraduationCap, Heart, Shirt,
  Package, Factory, Truck, Store, Coffee, Smartphone, Globe, Hammer
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts"

interface DashboardData {
  totalCompanies: number
  activeCompanies: number
  companiesByState: Array<{ uf: string; total: number; active: number }>
  companiesBySize: Array<{ porte: string; total: number; percentage: number }>
  companiesBySector: Array<{ setor: string; total: number; codigo?: string }>
  companiesByStatus: Array<{ status: string; total: number; color: string }>
  monthlyGrowth: Array<{ month: string; total: number; new: number }>
}

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedState, setSelectedState] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("6months")

  useEffect(() => {
    fetchDashboardData()
  }, [selectedState, selectedPeriod])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedState !== "all") params.append("uf", selectedState)
      if (selectedPeriod !== "all") params.append("period", selectedPeriod)

      const response = await fetch(`/api/companies/analytics?${params}`)
      const result = await response.json()
      
      setData(result)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartConfig = {
    total: {
      label: "Total",
      color: COLORS.primary,
    },
    active: {
      label: "Ativas",
      color: COLORS.success,
    },
    new: {
      label: "Novas",
      color: COLORS.info,
    },
  }

  const getSectorIcon = (sectorName: string) => {
    const name = sectorName.toLowerCase()
    
    if (name.includes('comércio') || name.includes('varejo') || name.includes('atacado')) return ShoppingCart
    if (name.includes('construção') || name.includes('obras')) return Hammer
    if (name.includes('imobiliária') || name.includes('imóveis')) return Home
    if (name.includes('veículos') || name.includes('automóveis') || name.includes('motos')) return Car
    if (name.includes('alimentação') || name.includes('restaurante') || name.includes('lanchonete')) return Utensils
    if (name.includes('educação') || name.includes('ensino') || name.includes('escola')) return GraduationCap
    if (name.includes('saúde') || name.includes('médico') || name.includes('clínica')) return Heart
    if (name.includes('vestuário') || name.includes('roupa') || name.includes('confecção')) return Shirt
    if (name.includes('indústria') || name.includes('fabricação') || name.includes('manufatura')) return Factory
    if (name.includes('transporte') || name.includes('logística') || name.includes('entrega')) return Truck
    if (name.includes('mercado') || name.includes('minimercado') || name.includes('supermercado')) return Store
    if (name.includes('café') || name.includes('padaria') || name.includes('confeitaria')) return Coffee
    if (name.includes('tecnologia') || name.includes('informática') || name.includes('software')) return Smartphone
    if (name.includes('serviços') || name.includes('consultoria')) return Globe
    if (name.includes('manutenção') || name.includes('reparação') || name.includes('conserto')) return Wrench
    
    return Briefcase // Default icon
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-sidebar-border">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">Relatórios</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-4">
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                <SelectItem value="PR">Paraná</SelectItem>
                <SelectItem value="SC">Santa Catarina</SelectItem>
                <SelectItem value="BA">Bahia</SelectItem>
                <SelectItem value="PE">Pernambuco</SelectItem>
                <SelectItem value="CE">Ceará</SelectItem>
                <SelectItem value="GO">Goiás</SelectItem>
                <SelectItem value="DF">Distrito Federal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="1year">Último ano</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {data?.totalCompanies.toLocaleString("pt-BR")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +12% em relação ao mês anterior
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {data?.activeCompanies.toLocaleString("pt-BR")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((data?.activeCompanies || 0) / (data?.totalCompanies || 1) * 100).toFixed(1)}% do total
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Atividade</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {((data?.activeCompanies || 0) / (data?.totalCompanies || 1) * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Empresas em operação
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">+2.5%</div>
                    <p className="text-xs text-muted-foreground">
                      Média dos últimos 6 meses
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="geographic">Distribuição Geográfica</TabsTrigger>
              <TabsTrigger value="sectors">Setores</TabsTrigger>
              <TabsTrigger value="growth">Crescimento</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Companies by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Empresas por Situação</CardTitle>
                    <CardDescription>
                      Distribuição das empresas por situação cadastral
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[300px]" />
                    ) : (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Pie
                            data={data?.companiesByStatus || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="total"
                          >
                            {data?.companiesByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartLegend content={<ChartLegendContent />} />
                        </PieChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Companies by Size */}
                <Card>
                  <CardHeader>
                    <CardTitle>Empresas por Porte</CardTitle>
                    <CardDescription>
                      Classificação das empresas por tamanho
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[300px]" />
                    ) : (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <BarChart data={data?.companiesBySize || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="porte" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="total" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="geographic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Estado</CardTitle>
                  <CardDescription>
                    Número de empresas ativas e totais por estado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[400px]" />
                  ) : (
                    <ChartContainer config={chartConfig} className="h-[400px]">
                      <BarChart data={data?.companiesByState || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="uf" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="total" fill={COLORS.primary} />
                        <Bar dataKey="active" fill={COLORS.success} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sectors" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Top 10 Setores de Atividade</h3>
                    <p className="text-sm text-muted-foreground">
                      Setores com maior número de empresas cadastradas
                    </p>
                  </div>
                  {!loading && data && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Export sectors data as CSV
                        const csv = [
                          ['Posição', 'Setor', 'CNAE', 'Total de Empresas', 'Percentual'],
                          ...data.companiesBySector.slice(0, 10).map((sector, index) => [
                            index + 1,
                            sector.setor,
                            sector.codigo || '',
                            sector.total,
                            ((sector.total / data.totalCompanies) * 100).toFixed(2) + '%'
                          ])
                        ].map(row => row.join(',')).join('\n')
                        
                        const blob = new Blob([csv], { type: 'text/csv' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `top-setores-${new Date().toISOString().split('T')[0]}.csv`
                        a.click()
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  )}
                </div>

                {/* Summary Cards */}
                {!loading && data && (
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total de Setores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{data.companiesBySector.length}</div>
                        <p className="text-xs text-muted-foreground">setores identificados</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Setor Líder</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold line-clamp-1">
                          {data.companiesBySector[0]?.setor.split(' ').slice(0, 3).join(' ')}...
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {data.companiesBySector[0]?.total.toLocaleString("pt-BR")} empresas
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Concentração Top 10</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {((data.companiesBySector.slice(0, 10).reduce((sum, s) => sum + s.total, 0) / data.totalCompanies) * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">do total de empresas</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(10)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-full mb-4" />
                          <Skeleton className="h-8 w-24" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {data?.companiesBySector.slice(0, 10).map((sector, index) => {
                      const totalEmpresas = data.totalCompanies || 1
                      const percentage = ((sector.total / totalEmpresas) * 100).toFixed(2)
                      const sectorColors = [
                        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", 
                        "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-yellow-500",
                        "bg-red-500", "bg-cyan-500"
                      ]
                      const bgColors = [
                        "bg-blue-50 dark:bg-blue-950/20", "bg-green-50 dark:bg-green-950/20", 
                        "bg-purple-50 dark:bg-purple-950/20", "bg-orange-50 dark:bg-orange-950/20",
                        "bg-pink-50 dark:bg-pink-950/20", "bg-indigo-50 dark:bg-indigo-950/20",
                        "bg-teal-50 dark:bg-teal-950/20", "bg-yellow-50 dark:bg-yellow-950/20",
                        "bg-red-50 dark:bg-red-950/20", "bg-cyan-50 dark:bg-cyan-950/20"
                      ]
                      const iconColors = [
                        "text-blue-600 dark:text-blue-400", "text-green-600 dark:text-green-400",
                        "text-purple-600 dark:text-purple-400", "text-orange-600 dark:text-orange-400",
                        "text-pink-600 dark:text-pink-400", "text-indigo-600 dark:text-indigo-400",
                        "text-teal-600 dark:text-teal-400", "text-yellow-600 dark:text-yellow-400",
                        "text-red-600 dark:text-red-400", "text-cyan-600 dark:text-cyan-400"
                      ]
                      
                      return (
                        <Card key={sector.codigo || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className={`h-2 ${sectorColors[index]}`} />
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base font-medium line-clamp-2">
                                  {sector.setor}
                                </CardTitle>
                                {sector.codigo && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    CNAE: {sector.codigo}
                                  </p>
                                )}
                              </div>
                              <div className={`p-2 rounded-lg ${bgColors[index]}`}>
                                {React.createElement(getSectorIcon(sector.setor), {
                                  className: `h-4 w-4 ${iconColors[index]}`
                                })}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-baseline justify-between mb-1">
                                  <span className="text-2xl font-bold">
                                    {sector.total.toLocaleString("pt-BR")}
                                  </span>
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {percentage}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  empresas neste setor
                                </p>
                              </div>
                              
                              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`absolute top-0 left-0 h-full ${sectorColors[index]} transition-all duration-500`}
                                  style={{ width: `${Math.min(parseFloat(percentage) * 10, 100)}%` }}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Posição: #{index + 1}
                                </span>
                                <span className={`font-medium ${iconColors[index]}`}>
                                  Top {index + 1}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
                
                {data && data.companiesBySector.length > 10 && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-center text-muted-foreground">
                        Mostrando os 10 principais setores de {data.companiesBySector.length} setores identificados
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="growth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento Mensal</CardTitle>
                  <CardDescription>
                    Evolução do número de empresas ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[400px]" />
                  ) : (
                    <ChartContainer config={chartConfig} className="h-[400px]">
                      <AreaChart data={data?.monthlyGrowth || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stackId="1"
                          stroke={COLORS.primary}
                          fill={COLORS.primary}
                        />
                        <Area
                          type="monotone"
                          dataKey="new"
                          stackId="1"
                          stroke={COLORS.info}
                          fill={COLORS.info}
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}