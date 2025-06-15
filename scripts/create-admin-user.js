const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env.local' });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

// Função para gerar hash de senha
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Função principal para criar usuário admin
async function createAdminUser() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Dados do usuário admin
    const adminEmail = 'admin@cnpjntelligence.com';
    const adminPassword = 'Admin@123456'; // Senha padrão - DEVE SER ALTERADA EM PRODUÇÃO
    const adminName = 'Administrador';
    
    // Verificar se o usuário admin já existe
    const checkQuery = 'SELECT id FROM app_users WHERE email = $1';
    const checkResult = await client.query(checkQuery, [adminEmail]);
    
    if (checkResult.rows.length > 0) {
      console.log('⚠️  Usuário admin já existe!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🆔 ID: ${checkResult.rows[0].id}`);
      
      // Perguntar se deseja atualizar a senha
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Deseja atualizar a senha do admin? (s/n): ', resolve);
      });
      
      if (answer.toLowerCase() === 's') {
        // Adicionar campo password_hash se não existir
        await addPasswordColumn();
        
        // Atualizar senha
        const updateQuery = `
          UPDATE app_users 
          SET password_hash = $1, 
              updated_at = NOW() 
          WHERE email = $2
        `;
        await client.query(updateQuery, [await hashPassword(adminPassword), adminEmail]);
        console.log('✅ Senha do admin atualizada com sucesso!');
      }
      
      rl.close();
    } else {
      // Adicionar campo password_hash se não existir
      await addPasswordColumn();
      
      // Criar novo usuário admin
      const insertQuery = `
        INSERT INTO app_users (email, name, password_hash, subscription_status, subscription_expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      
      // Admin tem acesso completo sem expiração
      const result = await client.query(insertQuery, [
        adminEmail,
        adminName,
        await hashPassword(adminPassword),
        'active',
        new Date('2099-12-31') // Data de expiração muito distante
      ]);
      
      console.log('✅ Usuário admin criado com sucesso!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Senha: ${adminPassword}`);
      console.log(`🆔 ID: ${result.rows[0].id}`);
      console.log('\n⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');
    }
    
    // Mostrar informações sobre a tabela app_users
    const countQuery = 'SELECT COUNT(*) as total FROM app_users';
    const countResult = await client.query(countQuery);
    console.log(`\n📊 Total de usuários no sistema: ${countResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    console.error('Detalhes:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Conexão com banco encerrada.');
  }
}

// Função para adicionar coluna password_hash se não existir
async function addPasswordColumn() {
  try {
    // Verificar se a coluna password_hash existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'app_users' 
      AND column_name = 'password_hash'
    `;
    
    const columnExists = await client.query(checkColumnQuery);
    
    if (columnExists.rows.length === 0) {
      console.log('➕ Adicionando coluna password_hash...');
      
      // Adicionar coluna password_hash
      await client.query(`
        ALTER TABLE app_users 
        ADD COLUMN password_hash TEXT
      `);
      
      // Adicionar coluna updated_at se não existir
      const checkUpdatedAtQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'app_users' 
        AND column_name = 'updated_at'
      `;
      
      const updatedAtExists = await client.query(checkUpdatedAtQuery);
      
      if (updatedAtExists.rows.length === 0) {
        await client.query(`
          ALTER TABLE app_users 
          ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()
        `);
      }
      
      console.log('✅ Colunas adicionadas com sucesso!');
    }
  } catch (error) {
    console.error('⚠️ Erro ao adicionar colunas:', error.message);
  }
}

// Executar o script
if (require.main === module) {
  console.log('🚀 Script de criação de usuário admin');
  console.log('=====================================\n');
  createAdminUser().catch(console.error);
}

module.exports = { createAdminUser };