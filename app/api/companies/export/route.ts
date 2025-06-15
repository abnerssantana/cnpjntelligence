import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json()

    let query = supabase
      .from("establishments")
      .select(`
        cnpj_completo,
        companies!inner(razao_social, porte_empresa, natureza_juridica),
        nome_fantasia,
        situacao_cadastral,
        uf,
        municipio,
        cnae_fiscal_principal,
        logradouro,
        numero,
        bairro,
        cep,
        correio_eletronico
      `)
      .limit(10000) // Limit for export

    // Apply same filters as search
    if (filters.uf) query = query.eq("uf", filters.uf)
    if (filters.municipio) query = query.eq("municipio", filters.municipio)
    if (filters.situacao) query = query.eq("situacao_cadastral", filters.situacao)
    if (filters.cnae) query = query.eq("cnae_fiscal_principal", filters.cnae)
    if (filters.porte) query = query.eq("companies.porte_empresa", filters.porte)

    const { data: companies, error } = await query

    if (error) {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Format data for Excel
    const excelData =
      companies?.map((company) => ({
        CNPJ: company.cnpj_completo,
        "Razão Social": company.companies?.razao_social,
        "Nome Fantasia": company.nome_fantasia,
        Situação: getSituacaoLabel(company.situacao_cadastral),
        Porte: getPorteLabel(company.companies?.porte_empresa),
        UF: company.uf,
        Município: company.municipio,
        "CNAE Principal": company.cnae_fiscal_principal,
        Endereço: `${company.logradouro}, ${company.numero}`,
        Bairro: company.bairro,
        CEP: company.cep,
        Email: company.correio_eletronico,
      })) || []

    // Create Excel workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)
    XLSX.utils.book_append_sheet(wb, ws, "Empresas")

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=cnpj-data.xlsx",
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

function getSituacaoLabel(situacao: number): string {
  const situacoes: { [key: number]: string } = {
    1: "Nula",
    2: "Ativa",
    3: "Suspensa",
    4: "Inapta",
    8: "Baixada",
  }
  return situacoes[situacao] || "Desconhecida"
}

function getPorteLabel(porte: number): string {
  const portes: { [key: number]: string } = {
    0: "Não Informado",
    1: "Micro Empresa",
    3: "Pequeno Porte",
    5: "Demais",
  }
  return portes[porte] || "Não Informado"
}
