import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Configuração SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function setupDatabase() {
  console.log('🔧 Configurando banco de dados...\n');

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL ou POSTGRES_URL não encontrada nas variáveis de ambiente');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    // Executar script de criação das tabelas simplificadas
    console.log('📋 Criando tabelas principais...');
    const simplifiedTablesSql = fs.readFileSync(
      path.join(__dirname, '02-create-simplified-tables.sql'),
      'utf8'
    );
    
    await client.query(simplifiedTablesSql);
    console.log('✅ Tabelas principais criadas\n');

    // Executar script de criação da tabela de usuários
    console.log('📋 Criando tabela de usuários...');
    const usersTableSql = fs.readFileSync(
      path.join(__dirname, '03-create-users-table.sql'),
      'utf8'
    );
    
    await client.query(usersTableSql);
    console.log('✅ Tabela de usuários criada\n');

    console.log('🎉 Banco de dados configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executar setup
setupDatabase();