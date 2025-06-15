"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"

interface CompanyFiltersProps {
  filters: any
  onFilterChange: (key: string, value: string) => void
  onSearch: () => void
  loading: boolean
}

export function CompanyFilters({ filters, onFilterChange, onSearch, loading }: CompanyFiltersProps) {
  const [states, setStates] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [cnaes, setCNAEs] = useState([])

  useEffect(() => {
    // Load reference data
    loadStates()
    loadCNAEs()
  }, [])

  useEffect(() => {
    if (filters.uf) {
      loadMunicipalities(filters.uf)
    }
  }, [filters.uf])

  const loadStates = async () => {
    // Mock data - replace with actual API call
    setStates([
      { code: "SP", name: "São Paulo" },
      { code: "RJ", name: "Rio de Janeiro" },
      { code: "MG", name: "Minas Gerais" },
      { code: "RS", name: "Rio Grande do Sul" },
      { code: "PR", name: "Paraná" },
    ])
  }

  const loadMunicipalities = async (uf: string) => {
    // Mock data - replace with actual API call
    setMunicipalities([
      { code: "3550308", name: "São Paulo" },
      { code: "3304557", name: "Rio de Janeiro" },
      { code: "3106200", name: "Belo Horizonte" },
    ])
  }

  const loadCNAEs = async () => {
    // Mock data - replace with actual API call
    setCNAEs([
      { code: "4711302", name: "Comércio varejista de mercadorias em geral" },
      { code: "6201501", name: "Desenvolvimento de programas de computador sob encomenda" },
      { code: "7020400", name: "Atividades de consultoria em gestão empresarial" },
    ])
  }

  const exportData = async () => {
    try {
      const response = await fetch("/api/companies/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "cnpj-data.xlsx"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Pesquisa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="uf">Estado (UF)</Label>
            <Select value={filters.uf} onValueChange={(value) => onFilterChange("uf", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state: any) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipio">Município</Label>
            <Select
              value={filters.municipio}
              onValueChange={(value) => onFilterChange("municipio", value)}
              disabled={!filters.uf}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o município" />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map((city: any) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="porte">Porte da Empresa</Label>
            <Select value={filters.porte} onValueChange={(value) => onFilterChange("porte", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">Micro Empresa</SelectItem>
                <SelectItem value="03">Empresa de Pequeno Porte</SelectItem>
                <SelectItem value="05">Demais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="situacao">Situação Cadastral</Label>
            <Select value={filters.situacao} onValueChange={(value) => onFilterChange("situacao", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="02">Ativa</SelectItem>
                <SelectItem value="03">Suspensa</SelectItem>
                <SelectItem value="04">Inapta</SelectItem>
                <SelectItem value="08">Baixada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnae">CNAE Principal</Label>
            <Select value={filters.cnae} onValueChange={(value) => onFilterChange("cnae", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o CNAE" />
              </SelectTrigger>
              <SelectContent>
                {cnaes.map((cnae: any) => (
                  <SelectItem key={cnae.code} value={cnae.code}>
                    {cnae.code} - {cnae.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="Digite o CNPJ"
              value={filters.cnpj || ""}
              onChange={(e) => onFilterChange("cnpj", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={onSearch} disabled={loading} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {loading ? "Pesquisando..." : "Pesquisar"}
          </Button>
          <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
