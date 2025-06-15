import { supabaseServer } from '../lib/supabaseServer'

async function checkAdminUser() {
  try {
    console.log('Verificando usuários no banco de dados...\n')
    
    // Buscar todos os usuários
    const { data: users, error } = await supabaseServer
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados.')
      console.log('\nPara criar um usuário admin, execute:')
      console.log('npm run create-admin-user')
      return
    }
    
    console.log(`✅ Total de usuários encontrados: ${users.length}\n`)
    
    // Verificar se existe algum usuário com email admin
    const adminUser = users.find(user => 
      user.email.toLowerCase().includes('admin') || 
      user.name?.toLowerCase().includes('admin')
    )
    
    if (adminUser) {
      console.log('👤 Usuário admin encontrado:')
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Nome: ${adminUser.name || 'Não definido'}`)
      console.log(`   Status: ${adminUser.subscription_status}`)
      console.log(`   Criado em: ${new Date(adminUser.created_at).toLocaleString('pt-BR')}`)
      if (adminUser.subscription_expires_at) {
        console.log(`   Assinatura expira em: ${new Date(adminUser.subscription_expires_at).toLocaleString('pt-BR')}`)
      }
    } else {
      console.log('⚠️  Nenhum usuário admin encontrado.')
      console.log('\nLista de usuários existentes:')
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`)
        console.log(`   Nome: ${user.name || 'Não definido'}`)
        console.log(`   Status: ${user.subscription_status}`)
      })
    }
    
  } catch (error) {
    console.error('Erro ao executar script:', error)
  } finally {
    process.exit(0)
  }
}

// Executar verificação
checkAdminUser()