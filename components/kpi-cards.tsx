"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, TrendingDown, Activity } from "lucide-react"

interface KPICardsProps {
  kpis: {
    totalCompanies: number
    activeCompanies: number
    newCompanies: number
    closedCompanies: number
  }
}

export function KPICards({ kpis }: KPICardsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(kpis.totalCompanies)}</div>
          <p className="text-xs text-muted-foreground">Empresas encontradas com os filtros aplicados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
          <Activity className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatNumber(kpis.activeCompanies)}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.totalCompanies > 0 ? Math.round((kpis.activeCompanies / kpis.totalCompanies) * 100) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abertas (Último Ano)</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatNumber(kpis.newCompanies)}</div>
          <p className="text-xs text-muted-foreground">Empresas abertas nos últimos 12 meses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fechadas (Último Ano)</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatNumber(kpis.closedCompanies)}</div>
          <p className="text-xs text-muted-foreground">Empresas baixadas nos últimos 12 meses</p>
        </CardContent>
      </Card>
    </div>
  )
}
