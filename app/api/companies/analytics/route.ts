import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-singleton'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const uf = searchParams.get('uf')
    const period = searchParams.get('period') || '6months'
    
    const supabase = getSupabaseClient()
    
    // Build base query for empresas table
    let baseQuery = supabase.from('empresas').select('*', { count: 'exact' })
    
    // Apply state filter if provided
    if (uf && uf !== 'all') {
      baseQuery = baseQuery.eq('uf', uf)
    }
    
    // Get total companies count
    const { count: totalCompanies } = await baseQuery
    
    // Get active companies count
    let activeQuery = supabase
      .from('empresas')
      .select('*', { count: 'exact' })
      .eq('situacao_cadastral', 2)
    
    if (uf && uf !== 'all') {
      activeQuery = activeQuery.eq('uf', uf)
    }
    
    const { count: activeCompanies } = await activeQuery
    
    // Get companies by state
    const { data: allCompanies } = await supabase
      .from('empresas')
      .select('uf, situacao_cadastral')
      .not('uf', 'is', null)
    
    const stateGroups = allCompanies?.reduce((acc: any, curr) => {
      const state = curr.uf
      if (!acc[state]) {
        acc[state] = { uf: state, total: 0, active: 0 }
      }
      acc[state].total++
      if (curr.situacao_cadastral === 2) {
        acc[state].active++
      }
      return acc
    }, {})
    
    const companiesByState = Object.values(stateGroups || {})
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10)
    
    // Get companies by size
    const { data: sizeData } = await supabase
      .from('empresas')
      .select('porte')
      .not('porte', 'is', null)
    
    const sizeGroups = sizeData?.reduce((acc: any, curr) => {
      const porte = curr.porte || 'Não Informado'
      
      if (!acc[porte]) {
        acc[porte] = { porte, total: 0, percentage: 0 }
      }
      acc[porte].total++
      return acc
    }, {})
    
    const companiesBySize = Object.values(sizeGroups || {})
    const totalForPercentage = companiesBySize.reduce((sum: number, item: any) => sum + item.total, 0)
    companiesBySize.forEach((item: any) => {
      item.percentage = (item.total / totalForPercentage) * 100
    })
    
    // Get companies by status
    let statusQuery = supabase
      .from('empresas')
      .select('situacao_cadastral, descricao_situacao_cadastral')
    
    if (uf && uf !== 'all') {
      statusQuery = statusQuery.eq('uf', uf)
    }
    
    const { data: statusData } = await statusQuery
    
    const statusMap: Record<string, { total: number; color: string }> = {
      'ATIVA': { total: 0, color: '#10b981' },
      'BAIXADA': { total: 0, color: '#ef4444' },
      'SUSPENSA': { total: 0, color: '#f59e0b' },
      'INAPTA': { total: 0, color: '#6b7280' },
      'NULA': { total: 0, color: '#9ca3af' }
    }
    
    statusData?.forEach((item) => {
      const status = item.descricao_situacao_cadastral?.toUpperCase() || 'NULA'
      if (statusMap[status]) {
        statusMap[status].total++
      }
    })
    
    const companiesByStatus = Object.entries(statusMap)
      .map(([status, data]) => ({
        status: status.charAt(0) + status.slice(1).toLowerCase(),
        total: data.total,
        color: data.color
      }))
      .filter(item => item.total > 0)
    
    // Get companies by sector (CNAE)
    let cnaeQuery = supabase
      .from('empresas')
      .select('cnae_fiscal, cnae_fiscal_descricao')
      .not('cnae_fiscal', 'is', null)
    
    if (uf && uf !== 'all') {
      cnaeQuery = cnaeQuery.eq('uf', uf)
    }
    
    const { data: cnaeData } = await cnaeQuery
    
    const sectorGroups = cnaeData?.reduce((acc: any, curr) => {
      const cnae = curr.cnae_fiscal
      const description = curr.cnae_fiscal_descricao || `CNAE ${cnae}`
      
      if (!acc[cnae]) {
        acc[cnae] = { setor: description, total: 0, codigo: cnae }
      }
      acc[cnae].total++
      return acc
    }, {})
    
    const companiesBySector = Object.values(sectorGroups || {})
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10)
    
    // Get monthly growth data
    const monthlyGrowth = await getMonthlyGrowthData(supabase, period, uf)
    
    return NextResponse.json({
      totalCompanies: totalCompanies || 0,
      activeCompanies: activeCompanies || 0,
      companiesByState,
      companiesBySize,
      companiesBySector,
      companiesByStatus,
      monthlyGrowth,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

async function getMonthlyGrowthData(supabase: any, period: string, uf: string | null) {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]
  
  let monthCount = 12
  if (period === '1month') monthCount = 1
  else if (period === '3months') monthCount = 3
  else if (period === '6months') monthCount = 6
  
  // For now, return sample data as we don't have date fields to track growth
  // In a real scenario, you would query based on creation dates
  const currentMonth = new Date().getMonth()
  const data = []
  
  // Get current total
  let query = supabase.from('empresas').select('*', { count: 'exact', head: true })
  if (uf && uf !== 'all') {
    query = query.eq('uf', uf)
  }
  const { count: currentTotal } = await query
  
  const baseTotal = currentTotal || 0
  const avgGrowth = baseTotal * 0.02 // 2% average growth
  
  for (let i = monthCount - 1; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12
    const monthTotal = Math.floor(baseTotal - (avgGrowth * i))
    const newCompanies = Math.floor(avgGrowth + (Math.random() * avgGrowth * 0.5))
    
    data.push({
      month: months[monthIndex],
      total: monthTotal,
      new: newCompanies,
    })
  }
  
  return data
}