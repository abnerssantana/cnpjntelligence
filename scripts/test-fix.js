const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testFix() {
  console.log('Testing the fixed query...')
  
  try {
    // Test the new approach - get establishments first
    console.log('1. Testing establishments query...')
    const { data: companies, error } = await supabase
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
      .limit(2)
    
    if (error) {
      console.error('Error:', error)
      return
    }
    
    console.log('✓ Establishments query successful')
    console.log('Sample company:', companies[0])
    
    // Test enrichment
    if (companies && companies.length > 0) {
      console.log('\n2. Testing enrichment...')
      
      const municipioCodes = [...new Set(companies.map(c => c.municipio).filter(Boolean))]
      const cnaeCodes = [...new Set(companies.map(c => c.cnae_fiscal_principal).filter(Boolean))]
      
      console.log('Municipality codes:', municipioCodes.slice(0, 3))
      console.log('CNAE codes:', cnaeCodes.slice(0, 3))
      
      // Fetch municipality descriptions
      const { data: municipalities } = await supabase
        .from('municipalities')
        .select('codigo, descricao')
        .in('codigo', municipioCodes.slice(0, 5))
      
      // Fetch CNAE descriptions
      const { data: cnaes } = await supabase
        .from('cnaes')
        .select('codigo, descricao')
        .in('codigo', cnaeCodes.slice(0, 5))
      
      console.log('✓ Municipality lookup successful:', municipalities?.length || 0, 'found')
      console.log('✓ CNAE lookup successful:', cnaes?.length || 0, 'found')
      
      if (municipalities && municipalities.length > 0) {
        console.log('Sample municipality:', municipalities[0])
      }
      
      if (cnaes && cnaes.length > 0) {
        console.log('Sample CNAE:', cnaes[0])
      }
      
      // Test enrichment
      const municipalityMap = new Map(municipalities?.map(m => [m.codigo, m.descricao]) || [])
      const cnaeMap = new Map(cnaes?.map(c => [c.codigo, c.descricao]) || [])
      
      const enrichedCompany = {
        ...companies[0],
        municipalities: companies[0].municipio ? { descricao: municipalityMap.get(companies[0].municipio) } : null,
        cnaes: companies[0].cnae_fiscal_principal ? { descricao: cnaeMap.get(companies[0].cnae_fiscal_principal) } : null
      }
      
      console.log('\n3. Enriched company sample:')
      console.log('Municipality:', enrichedCompany.municipalities?.descricao)
      console.log('CNAE:', enrichedCompany.cnaes?.descricao)
      
      console.log('\n✅ Fix appears to be working!')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testFix()