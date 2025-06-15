"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"
import { getStates, getMunicipalities, getCNAEs, getCompanySizes, getCadastralSituations } from "@/app/dashboard/actions"

interface CompanyFiltersProps {
  filters: any
  onFilterChange: (key: string, value: string) => void
  onSearch: () => void
  loading: boolean
}

export function CompanyFilters({ filters, onFilterChange, onSearch, loading }: CompanyFiltersProps) {
  const [states, setStates] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<any[]>([])
  const [cnaes, setCNAEs] = useState<any[]>([])
  const [companySizes, setCompanySizes] = useState<any[]>([])
  const [cadastralSituations, setCadastralSituations] = useState<any[]>([])
  const [loadingStates, setLoadingStates] = useState(true)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingCNAEs, setLoadingCNAEs] = useState(true)

  useEffect(() => {
    // Load reference data
    loadStates()
    loadCNAEs()
    loadStaticData()
  }, [])

  useEffect(() => {
    if (filters.uf) {
      loadMunicipalities(filters.uf)
    } else {
      setMunicipalities([])
    }
  }, [filters.uf])

  const loadStates = async () => {
    try {
      setLoadingStates(true)
      const data = await getStates()
      setStates(data)
    } catch (error) {
      console.error('Error loading states:', error)
    } finally {
      setLoadingStates(false)
    }
  }

  const loadMunicipalities = async (uf: string) => {
    try {
      setLoadingMunicipalities(true)
      const data = await getMunicipalities(uf)
      setMunicipalities(data)
    } catch (error) {
      console.error('Error loading municipalities:', error)
    } finally {
      setLoadingMunicipalities(false)
    }
  }

  const loadCNAEs = async () => {
    try {
      setLoadingCNAEs(true)
      const data = await getCNAEs()
      setCNAEs(data)
    } catch (error) {
      console.error('Error loading CNAEs:', error)
    } finally {
      setLoadingCNAEs(false)
    }
  }

  const loadStaticData = async () => {
    try {
      const [sizes, situations] = await Promise.all([
        getCompanySizes(),
        getCadastralSituations()
      ])
      setCompanySizes(sizes)
      setCadastralSituations(situations)
    } catch (error) {
      console.error('Error loading static data:', error)
    }
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
                <SelectValue placeholder={loadingStates ? "Carregando..." : "Selecione o estado"} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
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
              disabled={!filters.uf || loadingMunicipalities}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingMunicipalities ? "Carregando..." : "Selecione o município"} />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map((city) => (
                  <SelectItem key={city.codigo} value={city.codigo.toString()}>
                    {city.descricao}
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
                <SelectItem value="all">Todos</SelectItem>
                {companySizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
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
                <SelectItem value="all">Todas</SelectItem>
                {cadastralSituations.map((situation) => (
                  <SelectItem key={situation.value} value={situation.value}>
                    {situation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnae">CNAE Principal</Label>
            <Select value={filters.cnae} onValueChange={(value) => onFilterChange("cnae", value)}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCNAEs ? "Carregando..." : "Selecione o CNAE"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {cnaes.map((cnae) => (
                  <SelectItem key={cnae.codigo} value={cnae.codigo}>
                    {cnae.codigo} - {cnae.descricao}
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
