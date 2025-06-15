import { Client } from 'pg'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createAdminUser() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
  })

  try {
    await client.connect()
    console.log('🔧 Criação de Usuário Admin\n')
    
    // Solicitar informações do usuário
    const email = await question('Email do admin (padrão: admin@cnpjntelligence.com): ') || 'admin@cnpjntelligence.com'
    const name = await question('Nome do admin (padrão: Administrador): ') || 'Administrador'
    const password = await question('Senha (padrão: admin123): ') || 'admin123'
    
    // Verificar se o usuário já existe
    const checkQuery = 'SELECT * FROM app_users WHERE email = $1'
    const checkResult = await client.query(checkQuery, [email])
    
    if (checkResult.rows.length > 0) {
      console.log('\n⚠️  Usuário já existe com este email!')
      console.log(`Email: ${checkResult.rows[0].email}`)
      console.log(`Nome: ${checkResult.rows[0].name}`)
      
      const update = await question('\nDeseja atualizar a senha deste usuário? (s/n): ')
      
      if (update.toLowerCase() === 's') {
        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(password, 10)
        
        // Atualizar usuário existente
        const updateQuery = `
          UPDATE app_users 
          SET password_hash = $1, name = $2, updated_at = NOW()
          WHERE email = $3
          RETURNING *
        `
        
        const updateResult = await client.query(updateQuery, [hashedPassword, name, email])
        
        console.log('\n✅ Usuário atualizado com sucesso!')
        console.log(`Email: ${updateResult.rows[0].email}`)
        console.log(`Nome: ${updateResult.rows[0].name}`)
      }
    } else {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Criar novo usuário
      const insertQuery = `
        INSERT INTO app_users (email, name, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *
      `
      
      const insertResult = await client.query(insertQuery, [email, name, hashedPassword])
      
      console.log('\n✅ Usuário admin criado com sucesso!')
      console.log(`Email: ${insertResult.rows[0].email}`)
      console.log(`Nome: ${insertResult.rows[0].name}`)
      console.log('\n📝 Use estas credenciais para fazer login na plataforma')
    }
    
  } catch (error) {
    console.error('\n❌ Erro:', error)
  } finally {
    await client.end()
    rl.close()
    process.exit(0)
  }
}

// Executar criação
createAdminUser()