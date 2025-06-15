const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config({ path: '../.env.local' });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

// Interface readline para interação com usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Função para gerar hash de senha
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Função para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para validar senha
function isValidPassword(password) {
  // Mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula e um número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

// Listar todos os usuários
async function listUsers() {
  try {
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
    
    console.log('\n📋 Lista de Usuários:');
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
    }
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error.message);
  }
}

// Criar novo usuário
async function createUser() {
  try {
    console.log('\n🆕 Criar Novo Usuário');
    console.log('====================\n');
    
    const email = await question('Email: ');
    if (!isValidEmail(email)) {
      console.log('❌ Email inválido!');
      return;
    }
    
    // Verificar se email já existe
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkResult = await client.query(checkQuery, [email]);
    
    if (checkResult.rows.length > 0) {
      console.log('❌ Este email já está cadastrado!');
      return;
    }
    
    const name = await question('Nome: ');
    const password = await question('Senha (mínimo 8 caracteres, com maiúsculas, minúsculas e números): ');
    
    if (!isValidPassword(password)) {
      console.log('❌ Senha não atende aos requisitos mínimos!');
      return;
    }
    
    const subscriptionStatus = await question('Status da assinatura (trial/active/inactive) [trial]: ') || 'trial';
    const daysValid = await question('Dias de validade da assinatura [30]: ') || '30';
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(daysValid));
    
    // Adicionar coluna password_hash se não existir
    await ensurePasswordColumn();
    
    const insertQuery = `
      INSERT INTO users (email, name, password_hash, subscription_status, subscription_expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const result = await client.query(insertQuery, [
      email,
      name,
      await hashPassword(password),
      subscriptionStatus,
      expirationDate
    ]);
    
    console.log('\n✅ Usuário criado com sucesso!');
    console.log(`ID: ${result.rows[0].id}`);
    console.log(`Assinatura válida até: ${expirationDate.toLocaleDateString('pt-BR')}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  }
}

// Atualizar usuário
async function updateUser() {
  try {
    await listUsers();
    
    console.log('\n📝 Atualizar Usuário');
    console.log('===================\n');
    
    const email = await question('Email do usuário a atualizar: ');
    
    const selectQuery = 'SELECT * FROM users WHERE email = $1';
    const user = await client.query(selectQuery, [email]);
    
    if (user.rows.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    const currentUser = user.rows[0];
    console.log(`\nAtualizando: ${currentUser.name} (${currentUser.email})`);
    
    const newName = await question(`Novo nome [${currentUser.name}]: `) || currentUser.name;
    const changePassword = await question('Alterar senha? (s/n) [n]: ');
    
    let updateQuery = 'UPDATE users SET name = $1, updated_at = NOW()';
    let params = [newName];
    let paramCount = 1;
    
    if (changePassword.toLowerCase() === 's') {
      const newPassword = await question('Nova senha: ');
      if (!isValidPassword(newPassword)) {
        console.log('❌ Senha não atende aos requisitos mínimos!');
        return;
      }
      await ensurePasswordColumn();
      updateQuery += `, password_hash = ${++paramCount}`;
      params.push(await hashPassword(newPassword));
    }
    
    const changeSubscription = await question('Alterar assinatura? (s/n) [n]: ');
    if (changeSubscription.toLowerCase() === 's') {
      const newStatus = await question(`Novo status (trial/active/inactive) [${currentUser.subscription_status}]: `) || currentUser.subscription_status;
      const daysToAdd = await question('Adicionar dias à assinatura [0]: ') || '0';
      
      updateQuery += `, subscription_status = $${++paramCount}`;
      params.push(newStatus);
      
      if (parseInt(daysToAdd) > 0) {
        const newExpiration = new Date(currentUser.subscription_expires_at || new Date());
        newExpiration.setDate(newExpiration.getDate() + parseInt(daysToAdd));
        updateQuery += `, subscription_expires_at = $${++paramCount}`;
        params.push(newExpiration);
      }
    }
    
    updateQuery += ` WHERE email = $${++paramCount}`;
    params.push(email);
    
    await client.query(updateQuery, params);
    console.log('\n✅ Usuário atualizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error.message);
  }
}

// Deletar usuário
async function deleteUser() {
  try {
    await listUsers();
    
    console.log('\n🗑️  Deletar Usuário');
    console.log('==================\n');
    
    const email = await question('Email do usuário a deletar: ');
    
    const selectQuery = 'SELECT * FROM users WHERE email = $1';
    const user = await client.query(selectQuery, [email]);
    
    if (user.rows.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    const confirm = await question(`Tem certeza que deseja deletar ${user.rows[0].name} (${email})? (s/n): `);
    
    if (confirm.toLowerCase() === 's') {
      const deleteQuery = 'DELETE FROM users WHERE email = $1';
      await client.query(deleteQuery, [email]);
      console.log('\n✅ Usuário deletado com sucesso!');
    } else {
      console.log('\n❌ Operação cancelada.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error.message);
  }
}

// Garantir que a coluna password_hash existe
async function ensurePasswordColumn() {
  try {
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'password_hash'
    `;
    
    const columnExists = await client.query(checkColumnQuery);
    
    if (columnExists.rows.length === 0) {
      await client.query('ALTER TABLE users ADD COLUMN password_hash TEXT');
    }
    
    // Verificar updated_at também
    const checkUpdatedAtQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'updated_at'
    `;
    
    const updatedAtExists = await client.query(checkUpdatedAtQuery);
    
    if (updatedAtExists.rows.length === 0) {
      await client.query('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()');
    }
  } catch (error) {
    // Ignorar erro se coluna já existir
  }
}

// Menu principal
async function showMenu() {
  console.log('\n🔧 Gerenciador de Usuários - CNPJ Intelligence');
  console.log('==============================================\n');
  console.log('1. Listar usuários');
  console.log('2. Criar novo usuário');
  console.log('3. Atualizar usuário');
  console.log('4. Deletar usuário');
  console.log('5. Sair\n');
  
  const choice = await question('Escolha uma opção (1-5): ');
  
  switch (choice) {
    case '1':
      await listUsers();
      break;
    case '2':
      await createUser();
      break;
    case '3':
      await updateUser();
      break;
    case '4':
      await deleteUser();
      break;
    case '5':
      console.log('\n👋 Até logo!');
      return false;
    default:
      console.log('\n❌ Opção inválida!');
  }
  
  return true;
}

// Função principal
async function main() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    let continuar = true;
    while (continuar) {
      continuar = await showMenu();
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    rl.close();
    await client.end();
    console.log('🔌 Conexão encerrada.');
  }
}

// Executar o script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { listUsers, createUser, updateUser, deleteUser };