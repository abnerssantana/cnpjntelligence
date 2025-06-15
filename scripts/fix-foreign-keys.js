const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixForeignKeys() {
  console.log('Fixing foreign key constraints...')
  
  try {
    // First, let's drop existing constraints if they exist (to avoid conflicts)
    console.log('1. Dropping existing constraints (if any)...')
    
    const dropConstraints = [
      'ALTER TABLE establishments DROP CONSTRAINT IF EXISTS fk_establishments_municipio;',
      'ALTER TABLE establishments DROP CONSTRAINT IF EXISTS fk_establishments_cnae;',
      'ALTER TABLE companies DROP CONSTRAINT IF EXISTS fk_companies_natureza_juridica;'
    ]
    
    for (const sql of dropConstraints) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error && !error.message.includes('does not exist')) {
        console.error('Error dropping constraint:', error)
      }
    }
    
    // Now create the foreign key constraints
    console.log('2. Creating foreign key constraints...')
    
    const createConstraints = [
      {
        name: 'municipalities foreign key',
        sql: 'ALTER TABLE establishments ADD CONSTRAINT fk_establishments_municipio FOREIGN KEY (municipio) REFERENCES municipalities(codigo);'
      },
      {
        name: 'cnaes foreign key',
        sql: 'ALTER TABLE establishments ADD CONSTRAINT fk_establishments_cnae FOREIGN KEY (cnae_fiscal_principal) REFERENCES cnaes(codigo);'
      },
      {
        name: 'legal natures foreign key',
        sql: 'ALTER TABLE companies ADD CONSTRAINT fk_companies_natureza_juridica FOREIGN KEY (natureza_juridica) REFERENCES legal_natures(codigo);'
      }
    ]
    
    for (const constraint of createConstraints) {
      console.log(`Creating ${constraint.name}...`)
      const { error } = await supabase.rpc('exec_sql', { sql: constraint.sql })
      if (error) {
        console.error(`Error creating ${constraint.name}:`, error)
      } else {
        console.log(`✓ ${constraint.name} created successfully`)
      }
    }
    
    // Create indexes for better performance
    console.log('3. Creating indexes...')
    
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_establishments_municipio_fk ON establishments(municipio);',
      'CREATE INDEX IF NOT EXISTS idx_establishments_cnae_fk ON establishments(cnae_fiscal_principal);',
      'CREATE INDEX IF NOT EXISTS idx_companies_natureza_juridica_fk ON companies(natureza_juridica);'
    ]
    
    for (const sql of createIndexes) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error) {
        console.error('Error creating index:', error)
      }
    }
    
    console.log('✓ Indexes created')
    
    // Test the relationships again
    console.log('4. Testing relationships...')
    
    const { data: testData, error: testError } = await supabase
      .from('establishments')
      .select(`
        cnpj_completo,
        municipio,
        municipalities(descricao)
      `)
      .limit(1)
    
    if (testError) {
      console.error('Relationship test failed:', testError)
      console.log('Note: You may need to refresh Supabase schema cache or restart the project')
    } else {
      console.log('✓ Relationships working!')
      console.log('Sample data:', testData)
    }
    
  } catch (error) {
    console.error('Fix failed:', error)
  }
}

fixForeignKeys()