const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔧 Testando conexão com o banco...');
  console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Definida' : 'Não definida');
  
  // Configurar SSL para Supabase
  console.log('URL:', process.env.POSTGRES_URL);
  
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');
    
    // Testar se a tabela app_users existe
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'app_users'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tabela app_users existe');
      
      // Verificar se há usuários
      const users = await client.query('SELECT COUNT(*) FROM app_users');
      console.log(`📊 Usuários cadastrados: ${users.rows[0].count}`);
    } else {
      console.log('❌ Tabela app_users não existe');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();