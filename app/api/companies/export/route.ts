import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json()
    
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
        )
      `)
      .limit(10000) // Limit export to 10k records

    // Apply filters
    if (filters.uf) {
      query = query.eq('uf', filters.uf)
    }
    if (filters.municipio) {
      query = query.eq('municipio', filters.municipio)
    }
    if (filters.situacao && filters.situacao !== 'all') {
      query = query.eq('situacao_cadastral', filters.situacao)
    }
    if (filters.cnae && filters.cnae !== 'all') {
      query = query.eq('cnae_fiscal_principal', filters.cnae)
    }
    if (filters.porte && filters.porte !== 'all') {
      query = query.eq('companies.porte_empresa', filters.porte)
    }
    if (filters.cnpj) {
      const cnpjClean = filters.cnpj.replace(/\D/g, '')
      query = query.like('cnpj_completo', `%${cnpjClean}%`)
    }
    if (filters.search) {
      query = query.or(`companies.razao_social.ilike.%${filters.search}%,nome_fantasia.ilike.%${filters.search}%`)
    }

    const { data: companies, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    // Enrich companies with municipality and CNAE descriptions
    let enrichedCompanies = companies || []
    
    if (companies && companies.length > 0) {
      // Get unique municipality codes
      const municipioCodes = [...new Set(companies.map((c: any) => c.municipio).filter(Boolean))]
      const cnaeCodes = [...new Set(companies.map((c: any) => c.cnae_fiscal_principal).filter(Boolean))]
      
      // Fetch municipality descriptions
      const { data: municipalities } = await supabaseServer
        .from('municipalities')
        .select('codigo, descricao')
        .in('codigo', municipioCodes)
      
      // Fetch CNAE descriptions
      const { data: cnaes } = await supabaseServer
        .from('cnaes')
        .select('codigo, descricao')
        .in('codigo', cnaeCodes)
      
      // Create lookup maps
      const municipalityMap = new Map(municipalities?.map(m => [m.codigo, m.descricao]) || [])
      const cnaeMap = new Map(cnaes?.map(c => [c.codigo, c.descricao]) || [])
      
      // Enrich companies with descriptions
      enrichedCompanies = companies.map((company: any) => ({
        ...company,
        municipalities: company.municipio ? { descricao: municipalityMap.get(company.municipio) } : null,
        cnaes: company.cnae_fiscal_principal ? { descricao: cnaeMap.get(company.cnae_fiscal_principal) } : null
      }))
    }

    // Format data for export
    const exportData = enrichedCompanies?.map(company => ({
      'CNPJ': formatCNPJ(company.cnpj_completo),
      'Razão Social': company.companies?.razao_social || '',
      'Nome Fantasia': company.nome_fantasia || '',
      'Situação Cadastral': getSituacaoLabel(company.situacao_cadastral),
      'Data Situação': formatDate(company.data_situacao_cadastral),
      'Porte': getPorteLabel(company.companies?.porte_empresa),
      'Capital Social': company.companies?.capital_social || 0,
      'CNAE Principal': company.cnae_fiscal_principal,
      'Descrição CNAE': company.cnaes?.descricao || '',
      'Logradouro': `${company.tipo_logradouro || ''} ${company.logradouro || ''}`.trim(),
      'Número': company.numero || '',
      'Complemento': company.complemento || '',
      'Bairro': company.bairro || '',
      'CEP': formatCEP(company.cep),
      'Município': company.municipalities?.descricao || '',
      'UF': company.uf || '',
      'Telefone': formatPhone(company.ddd1, company.telefone1),
      'Email': company.correio_eletronico || '',
      'Data Início Atividade': formatDate(company.data_inicio_atividade)
    })) || []

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Empresas')

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="cnpj-export-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

function formatCNPJ(cnpj: string) {
  if (!cnpj || cnpj.length !== 14) return cnpj
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

function formatCEP(cep: string) {
  if (!cep || cep.length !== 8) return cep
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
}

function formatPhone(ddd: string, phone: string) {
  if (!ddd || !phone) return ''
  return `(${ddd}) ${phone}`
}

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR')
}

function getSituacaoLabel(situacao: number) {
  const situacoes: Record<number, string> = {
    1: 'Nula',
    2: 'Ativa',
    3: 'Suspensa',
    4: 'Inapta',
    8: 'Baixada'
  }
  return situacoes[situacao] || 'Desconhecida'
}

function getPorteLabel(porte: number) {
  const portes: Record<number, string> = {
    0: 'Não Informado',
    1: 'Micro Empresa',
    3: 'Pequeno Porte',
    5: 'Demais'
  }
  return portes[porte] || 'Não Informado'
}