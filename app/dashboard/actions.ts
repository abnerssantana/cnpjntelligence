'use server'

import { supabaseServer } from "@/lib/supabaseServer"
import { unstable_cache } from 'next/cache'

export interface DashboardFilters {
  uf?: string
  municipio?: string
  porte?: string
  situacao?: string
  cnae?: string
  natureza_juridica?: string
  cnpj?: string
  search?: string
  page?: number
  limit?: number
}

export interface DashboardKPIs {
  totalCompanies: number
  activeCompanies: number
  newCompanies: number
  closedCompanies: number
}

// Cache global stats for 1 hour
const getGlobalStats = unstable_cache(
  async () => {
    const { count: totalCompanies } = await supabaseServer
      .from('companies')
      .select('*', { count: 'exact', head: true })

    const { count: activeCompanies } = await supabaseServer
      .from('establishments')
      .select('*', { count: 'exact', head: true })
      .eq('situacao_cadastral', 2)

    const { count: totalPartners } = await supabaseServer
      .from('partners')
      .select('*', { count: 'exact', head: true })

    const { data: capitalData } = await supabaseServer
      .from('companies')
      .select('capital_social')
      .not('capital_social', 'is', null)

    const totalCapital = capitalData?.reduce((sum, company) => sum + (company.capital_social || 0), 0) || 0

    const { count: states } = await supabaseServer
      .from('establishments')
      .select('uf', { count: 'exact', head: true })
      .not('uf', 'is', null)

    const { count: cities } = await supabaseServer
      .from('municipalities')
      .select('*', { count: 'exact', head: true })

    const { count: cnaes } = await supabaseServer
      .from('cnaes')
      .select('*', { count: 'exact', head: true })

    return {
      totalCompanies: totalCompanies || 0,
      activeCompanies: activeCompanies || 0,
      totalPartners: totalPartners || 0,
      totalCapital,
      states: states || 27,
      cities: cities || 5570,
      cnaes: cnaes || 1358,
      lastUpdate: new Date().getFullYear().toString()
    }
  },
  ['global-stats'],
  { revalidate: 3600 } // 1 hour
)

// Cache filtered data for 5 minutes
export async function getDashboardData(filters: DashboardFilters) {
  const cacheKey = `dashboard-${JSON.stringify(filters)}`
  
  return unstable_cache(
    async () => {
      const page = filters.page || 1
      const limit = filters.limit || 50
      const offset = (page - 1) * limit

      // Build query
      let query = supabaseServer
        .from('establishments')
        .select(`
          *,
          companies!inner(
            razao_social,
            natureza_juridica,
            capital_social,
            porte_empresa
          ),
          municipalities(descricao),
          cnaes!cnae_fiscal_principal(descricao)
        `, { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.uf) {
        query = query.eq('uf', filters.uf)
      }
      if (filters.municipio) {
        query = query.eq('municipio', filters.municipio)
      }
      if (filters.situacao) {
        query = query.eq('situacao_cadastral', filters.situacao)
      }
      if (filters.cnae) {
        query = query.eq('cnae_fiscal_principal', filters.cnae)
      }
      if (filters.porte && filters.porte !== 'all') {
        query = query.eq('companies.porte_empresa', filters.porte)
      }
      if (filters.natureza_juridica) {
        query = query.eq('companies.natureza_juridica', filters.natureza_juridica)
      }
      if (filters.cnpj) {
        const cnpjClean = filters.cnpj.replace(/\D/g, '')
        query = query.like('cnpj_completo', `%${cnpjClean}%`)
      }
      if (filters.search) {
        query = query.or(`companies.razao_social.ilike.%${filters.search}%,nome_fantasia.ilike.%${filters.search}%`)
      }

      const { data: companies, error, count } = await query

      if (error) {
        console.error('Error fetching companies:', error)
        throw new Error(error.message)
      }

      // Calculate KPIs based on filtered data
      const totalCompanies = count || 0
      const activeCompanies = companies?.filter((c: any) => c.situacao_cadastral === 2).length || 0
      
      // For new and closed companies, we'll calculate based on date ranges
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const newCompanies = companies?.filter((c: any) => {
        const startDate = new Date(c.data_inicio_atividade)
        return startDate >= thirtyDaysAgo
      }).length || 0

      const closedCompanies = companies?.filter((c: any) => 
        c.situacao_cadastral === 8 || c.situacao_cadastral === 3
      ).length || 0

      const kpis: DashboardKPIs = {
        totalCompanies,
        activeCompanies,
        newCompanies,
        closedCompanies
      }

      return {
        companies: companies || [],
        kpis,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      }
    },
    [cacheKey],
    { revalidate: 300 } // 5 minutes
  )()
}

// Get states for filter
export const getStates = unstable_cache(
  async () => {
    const { data } = await supabaseServer
      .from('establishments')
      .select('uf')
      .not('uf', 'is', null)
      .order('uf')

    const uniqueStates = [...new Set(data?.map(item => item.uf) || [])]
    return uniqueStates
  },
  ['states-list'],
  { revalidate: 86400 } // 24 hours
)

// Get municipalities by state
export async function getMunicipalities(uf: string) {
  if (!uf) return []
  
  const { data } = await supabaseServer
    .from('establishments')
    .select('municipio, municipalities(codigo, descricao)')
    .eq('uf', uf)
    .not('municipio', 'is', null)
    .order('municipalities(descricao)')

  const uniqueMunicipalities = data?.reduce((acc: any[], item: any) => {
    if (item.municipalities && !acc.find(m => m.codigo === item.municipio)) {
      acc.push({
        codigo: item.municipio,
        descricao: item.municipalities.descricao
      })
    }
    return acc
  }, []) || []

  return uniqueMunicipalities
}

// Get CNAEs for filter
export const getCNAEs = unstable_cache(
  async () => {
    const { data } = await supabaseServer
      .from('cnaes')
      .select('codigo, descricao')
      .order('descricao')
      .limit(100)

    return data || []
  },
  ['cnaes-list'],
  { revalidate: 86400 } // 24 hours
)

// Get company sizes
export async function getCompanySizes() {
  return [
    { value: '1', label: 'Microempresa' },
    { value: '3', label: 'Empresa de Pequeno Porte' },
    { value: '5', label: 'Demais' }
  ]
}

// Get cadastral situations
export async function getCadastralSituations() {
  return [
    { value: '2', label: 'Ativa' },
    { value: '3', label: 'Suspensa' },
    { value: '4', label: 'Inapta' },
    { value: '8', label: 'Baixada' }
  ]
}

// Export global stats for home page
export { getGlobalStats }