const { Client } = require('pg');
require('dotenv').config({ path: '../.env.local' });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function createAppUsersTable() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Criar nova tabela app_users
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT NOT NULL,
        subscription_status TEXT DEFAULT 'trial',
        subscription_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela app_users criada!');

    // Criar índice para email
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email)
    `);
    console.log('✅ Índice para email criado!');

    // Criar trigger para atualizar updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      CREATE TRIGGER update_app_users_updated_at 
      BEFORE UPDATE ON app_users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Trigger para updated_at criado!');

    // Mostrar estrutura da nova tabela
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'app_users'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Estrutura da tabela app_users:');
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
createAppUsersTable();