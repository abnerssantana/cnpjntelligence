const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function setupTables() {
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-empresas-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Creating tables...');
    await client.query(sql);
    
    console.log('✅ Tables created successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('empresas', 'empresa_socios', 'empresa_cnaes_secundarios')
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`✅ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed.');
  }
}

setupTables();