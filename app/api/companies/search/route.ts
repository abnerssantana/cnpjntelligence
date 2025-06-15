import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json()

    let query = supabase
      .from("establishments")
      .select(`
        *,
        companies!inner(*)
      `)
      .limit(1000)

    // Apply filters
    if (filters.uf) {
      query = query.eq("uf", filters.uf)
    }

    if (filters.municipio) {
      query = query.eq("municipio", filters.municipio)
    }

    if (filters.situacao) {
      query = query.eq("situacao_cadastral", filters.situacao)
    }

    if (filters.cnae) {
      query = query.eq("cnae_fiscal_principal", filters.cnae)
    }

    if (filters.porte) {
      query = query.eq("companies.porte_empresa", filters.porte)
    }

    if (filters.cnpj) {
      const cnpjClean = filters.cnpj.replace(/\D/g, "")
      query = query.like("cnpj_completo", `%${cnpjClean}%`)
    }

    const { data: companies, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Calculate KPIs
    const totalCompanies = companies?.length || 0
    const activeCompanies = companies?.filter((c) => c.situacao_cadastral === 2).length || 0

    // Mock data for new/closed companies (would need date filtering in real implementation)
    const newCompanies = Math.floor(totalCompanies * 0.15)
    const closedCompanies = Math.floor(totalCompanies * 0.08)

    const kpis = {
      totalCompanies,
      activeCompanies,
      newCompanies,
      closedCompanies,
    }

    return NextResponse.json({
      companies: companies || [],
      kpis,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
