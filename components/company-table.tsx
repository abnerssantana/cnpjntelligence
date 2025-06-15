"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"

interface CompanyTableProps {
  companies: any[]
  loading: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    totalCount: number
    onPageChange: (page: number) => void
  }
}

export function CompanyTable({ companies, loading, pagination }: CompanyTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCompanies = companies.filter(
    (company) =>
      company.companies?.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj_completo?.includes(searchTerm) ||
      company.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getSituacaoLabel = (situacao: number) => {
    const situacoes = {
      1: { label: "Nula", variant: "secondary" as const },
      2: { label: "Ativa", variant: "default" as const },
      3: { label: "Suspensa", variant: "destructive" as const },
      4: { label: "Inapta", variant: "destructive" as const },
      8: { label: "Baixada", variant: "secondary" as const },
    }
    return situacoes[situacao as keyof typeof situacoes] || { label: "Desconhecida", variant: "secondary" as const }
  }

  const getPorteLabel = (porte: number) => {
    const portes = {
      0: "Não Informado",
      1: "Micro Empresa",
      3: "Pequeno Porte",
      5: "Demais",
    }
    return portes[porte as keyof typeof portes] || "Não Informado"
  }

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj || cnpj.length !== 14) return cnpj
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando empresas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresas Encontradas</CardTitle>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por razão social ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CNPJ</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Porte</TableHead>
                <TableHead>UF</TableHead>
                <TableHead>CNAE Principal</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhuma empresa encontrada com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company, index) => (
                  <TableRow key={company.id || index}>
                    <TableCell className="font-mono text-sm">{formatCNPJ(company.cnpj_completo)}</TableCell>
                    <TableCell className="font-medium">{company.companies?.razao_social || "-"}</TableCell>
                    <TableCell>{company.nome_fantasia || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getSituacaoLabel(company.situacao_cadastral).variant}>
                        {getSituacaoLabel(company.situacao_cadastral).label}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPorteLabel(company.companies?.porte_empresa || 0)}</TableCell>
                    <TableCell>{company.uf}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{company.cnae_fiscal_principal}</span>
                        {company.cnaes?.descricao && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {company.cnaes.descricao}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {companies.length} de {pagination.totalCount} empresas
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
