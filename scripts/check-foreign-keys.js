const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkForeignKeys() {
  console.log('Checking foreign key constraints...')
  
  try {
    // Query to check foreign key constraints
    const { data, error } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'establishments'
            AND tc.table_schema = 'public';
        `
      })
    
    if (error) {
      console.error('Error checking foreign keys:', error)
      
      // Alternative approach - direct SQL query
      console.log('\nTrying alternative approach...')
      const { data: altData, error: altError } = await supabase
        .from('pg_constraint')
        .select('*')
        .eq('contype', 'f')
      
      if (altError) {
        console.error('Alternative approach failed:', altError)
      } else {
        console.log('Alternative data:', altData)
      }
    } else {
      console.log('Foreign key constraints found:')
      console.table(data)
    }
    
  } catch (error) {
    console.error('Check failed:', error)
  }
}

checkForeignKeys()