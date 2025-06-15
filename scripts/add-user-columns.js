const { Client } = require('pg');
require('dotenv').config({ path: '../.env.local' });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function addUserColumns() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Adicionar coluna password_hash se não existir
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN password_hash TEXT
      `);
      console.log('✅ Coluna password_hash adicionada!');
    } catch (error) {
      if (error.code === '42701') { // Column already exists
        console.log('ℹ️  Coluna password_hash já existe');
      } else {
        throw error;
      }
    }

    // Adicionar coluna updated_at se não existir
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()
      `);
      console.log('✅ Coluna updated_at adicionada!');
    } catch (error) {
      if (error.code === '42701') { // Column already exists
        console.log('ℹ️  Coluna updated_at já existe');
      } else {
        throw error;
      }
    }

    // Criar índice para email
    try {
      await client.query(`
        CREATE INDEX idx_users_email ON users(email)
      `);
      console.log('✅ Índice para email criado!');
    } catch (error) {
      if (error.code === '42P07') { // Index already exists
        console.log('ℹ️  Índice para email já existe');
      } else {
        throw error;
      }
    }

    // Mostrar estrutura atual da tabela
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Estrutura atual da tabela users:');
    console.log('=====================================');
    result.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

// Executar
addUserColumns();