const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRelationships() {
  console.log('Testing database relationships...')
  
  try {
    // Test 1: Basic establishments query
    console.log('\n1. Testing basic establishments query...')
    const { data: basic, error: basicError } = await supabase
      .from('establishments')
      .select('*')
      .limit(1)
    
    if (basicError) {
      console.error('Basic query error:', basicError)
    } else {
      console.log('✓ Basic establishments query works')
    }

    // Test 2: Companies relationship
    console.log('\n2. Testing companies relationship...')
    const { data: withCompanies, error: companiesError } = await supabase
      .from('establishments')
      .select(`
        cnpj_completo,
        companies(razao_social)
      `)
      .limit(1)
    
    if (companiesError) {
      console.error('Companies relationship error:', companiesError)
    } else {
      console.log('✓ Companies relationship works')
    }

    // Test 3: Municipalities relationship (problematic one)
    console.log('\n3. Testing municipalities relationship...')
    const { data: withMunicipalities, error: municipalitiesError } = await supabase
      .from('establishments')
      .select(`
        cnpj_completo,
        municipio,
        municipalities(descricao)
      `)
      .limit(1)
    
    if (municipalitiesError) {
      console.error('Municipalities relationship error:', municipalitiesError)
      
      // Try alternative approach
      console.log('\n3a. Trying alternative municipalities query...')
      const { data: altMunicipalities, error: altMunicipalitiesError } = await supabase
        .from('establishments')
        .select(`
          cnpj_completo,
          municipio
        `)
        .limit(1)
      
      if (altMunicipalitiesError) {
        console.error('Alternative municipalities error:', altMunicipalitiesError)
      } else {
        console.log('✓ Alternative municipalities query works')
        console.log('Sample data:', altMunicipalities)
      }
    } else {
      console.log('✓ Municipalities relationship works')
    }

    // Test 4: CNAEs relationship
    console.log('\n4. Testing CNAEs relationship...')
    const { data: withCnaes, error: cnaesError } = await supabase
      .from('establishments')
      .select(`
        cnpj_completo,
        cnae_fiscal_principal,
        cnaes(descricao)
      `)
      .limit(1)
    
    if (cnaesError) {
      console.error('CNAEs relationship error:', cnaesError)
    } else {
      console.log('✓ CNAEs relationship works')
    }

    // Test 5: Check if reference tables have data
    console.log('\n5. Checking reference tables...')
    
    const { count: municipalitiesCount } = await supabase
      .from('municipalities')
      .select('*', { count: 'exact', head: true })
    
    const { count: cnaesCount } = await supabase
      .from('cnaes')
      .select('*', { count: 'exact', head: true })
    
    console.log(`Municipalities count: ${municipalitiesCount}`)
    console.log(`CNAEs count: ${cnaesCount}`)

    // Test 6: Check foreign key constraints
    console.log('\n6. Checking foreign key constraints...')
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('get_foreign_keys', { table_name: 'establishments' })
    
    if (constraintsError) {
      console.log('Could not check constraints (function may not exist)')
    } else {
      console.log('Foreign key constraints:', constraints)
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testRelationships()