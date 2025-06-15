const { Client } = require('pg');
require('dotenv').config({ path: '../.env.local' });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function listUsers() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');
    
    const query = `
      SELECT 
        id, 
        email, 
        name, 
        subscription_status, 
        subscription_expires_at,
        created_at,
        CASE 
          WHEN subscription_expires_at > NOW() THEN 'Ativo'
          ELSE 'Expirado'
        END as status
      FROM users 
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query);
    
    console.log('📋 Lista de Usuários:');
    console.log('====================\n');
    
    if (result.rows.length === 0) {
      console.log('Nenhum usuário encontrado.');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Sem nome'} (${user.email})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Status: ${user.subscription_status} (${user.status})`);
        console.log(`   Expira em: ${user.subscription_expires_at ? new Date(user.subscription_expires_at).toLocaleDateString('pt-BR') : 'N/A'}`);
        console.log(`   Criado em: ${new Date(user.created_at).toLocaleDateString('pt-BR')}`);
        console.log('');
      });
      
      console.log(`Total de usuários: ${result.rows.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

// Executar
listUsers();