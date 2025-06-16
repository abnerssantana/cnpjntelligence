const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config({ path: '../.env.local' });

async function verifyAdminUser() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : false
  });

  try {
    console.log('🔍 Verificando usuário admin...\n');
    
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    // Verificar se a tabela users existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Tabela "users" não encontrada!');
      console.log('Execute primeiro o script de setup do banco de dados.');
      return;
    }

    // Buscar usuário admin
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@cnpjntelligence.com']
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário admin não encontrado!');
      console.log('\nPara criar o usuário admin, execute:');
      console.log('  cd scripts');
      console.log('  node create-admin-user.js\n');
      return;
    }

    const admin = result.rows[0];
    console.log('✅ Usuário admin encontrado!\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Nome:', admin.name);
    console.log('📅 Criado em:', new Date(admin.created_at).toLocaleString('pt-BR'));
    console.log('💳 Status da assinatura:', admin.subscription_status);
    console.log('⏰ Expira em:', new Date(admin.subscription_expires_at).toLocaleString('pt-BR'));
    
    // Verificar se a assinatura está ativa
    const isActive = admin.subscription_status === 'active' && 
                     new Date(admin.subscription_expires_at) > new Date();
    
    console.log('🔐 Assinatura ativa:', isActive ? 'Sim' : 'Não');

    // Testar a senha padrão
    console.log('\n🔑 Testando senha padrão (Admin@123456)...');
    const testPassword = 'Admin@123456';
    const testHash = crypto.createHash('sha256').update(testPassword).digest('hex');
    const passwordMatches = testHash === admin.password_hash;
    
    if (passwordMatches) {
      console.log('✅ Senha padrão está funcionando!');
      console.log('\n⚠️  IMPORTANTE: Por segurança, altere a senha após o primeiro login!');
    } else {
      console.log('❌ Senha padrão não funciona.');
      console.log('A senha pode ter sido alterada.');
    }

    // Mostrar informações de debug
    console.log('\n🔧 Informações de Debug:');
    console.log('- Hash da senha Admin@123456:', testHash.substring(0, 20) + '...');
    console.log('- Hash armazenado:', admin.password_hash.substring(0, 20) + '...');
    console.log('- Método de hash: SHA256');

  } catch (error) {
    console.error('❌ Erro ao verificar usuário admin:', error.message);
    console.error('\nDetalhes:', error);
  } finally {
    await client.end();
    console.log('\n✅ Conexão fechada');
  }
}

// Executar verificação
verifyAdminUser();