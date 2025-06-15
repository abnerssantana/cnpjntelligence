const { Client } = require('pg');
require('dotenv').config({ path: '../.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function checkTables() {
  try {
    console.log('Conectando ao banco de dados...');
    await client.connect();
    console.log('Conectado com sucesso!');

    // Verificar se as tabelas existem
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    console.log('\n=== TABELAS EXISTENTES ===');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Verificar estrutura da tabela companies
    if (result.rows.some(row => row.table_name === 'companies')) {
      const companiesStructure = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n=== ESTRUTURA DA TABELA COMPANIES ===');
      companiesStructure.rows.forEach(col => {
        console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // Verificar estrutura da tabela establishments
    if (result.rows.some(row => row.table_name === 'establishments')) {
      const establishmentsStructure = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'establishments' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n=== ESTRUTURA DA TABELA ESTABLISHMENTS ===');
      establishmentsStructure.rows.forEach(col => {
        console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // Contar registros existentes
    if (result.rows.some(row => row.table_name === 'companies')) {
      const companiesCount = await client.query('SELECT COUNT(*) FROM companies');
      console.log(`\nRegistros em companies: ${companiesCount.rows[0].count}`);
    }

    if (result.rows.some(row => row.table_name === 'establishments')) {
      const establishmentsCount = await client.query('SELECT COUNT(*) FROM establishments');
      console.log(`Registros em establishments: ${establishmentsCount.rows[0].count}`);
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.end();
    console.log('\nConexão encerrada.');
  }
}

checkTables().catch(console.error);