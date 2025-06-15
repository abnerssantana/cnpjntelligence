import { supabaseServer } from '../lib/supabaseServer'
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
  try {
    console.log('🔧 Criação de Usuário Admin\n')
    
    // Solicitar informações do usuário
    const email = await question('Email do admin (padrão: admin@cnpjanalytics.com): ') || 'admin@cnpjanalytics.com'
    const name = await question('Nome do admin (padrão: Administrador): ') || 'Administrador'
    
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      console.log('\n⚠️  Usuário já existe com este email!')
      console.log(`Email: ${existingUser.email}`)
      console.log(`Nome: ${existingUser.name}`)
      console.log(`Status: ${existingUser.subscription_status}`)
      
      const update = await question('\nDeseja atualizar este usuário? (s/n): ')
      
      if (update.toLowerCase() === 's') {
        // Atualizar usuário existente
        const { data: updatedUser, error } = await supabaseServer
          .from('users')
          .update({
            name: name,
            subscription_status: 'active',
            subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano
          })
          .eq('email', email)
          .select()
          .single()
        
        if (error) {
          console.error('\n❌ Erro ao atualizar usuário:', error)
        } else {
          console.log('\n✅ Usuário atualizado com sucesso!')
          console.log(`Email: ${updatedUser.email}`)
          console.log(`Nome: ${updatedUser.name}`)
          console.log(`Status: ${updatedUser.subscription_status}`)
          console.log(`Assinatura válida até: ${new Date(updatedUser.subscription_expires_at).toLocaleDateString('pt-BR')}`)
        }
      }
    } else {
      // Criar novo usuário
      const { data: newUser, error } = await supabaseServer
        .from('users')
        .insert({
          email: email,
          name: name,
          subscription_status: 'active',
          subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano
        })
        .select()
        .single()
      
      if (error) {
        console.error('\n❌ Erro ao criar usuário:', error)
      } else {
        console.log('\n✅ Usuário admin criado com sucesso!')
        console.log(`Email: ${newUser.email}`)
        console.log(`Nome: ${newUser.name}`)
        console.log(`Status: ${newUser.subscription_status}`)
        console.log(`Assinatura válida até: ${new Date(newUser.subscription_expires_at).toLocaleDateString('pt-BR')}`)
        
        console.log('\n📝 Observações:')
        console.log('- Este usuário foi criado diretamente no banco de dados')
        console.log('- Para fazer login, você precisará usar o Supabase Auth')
        console.log('- Configure a autenticação no Supabase Dashboard')
      }
    }
    
  } catch (error) {
    console.error('Erro ao executar script:', error)
  } finally {
    rl.close()
    process.exit(0)
  }
}

// Executar criação
createAdminUser()