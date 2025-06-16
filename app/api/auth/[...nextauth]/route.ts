import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Verificação de variáveis críticas em produção
if (process.env.NODE_ENV === 'production') {
  const missingVars = []
  if (!process.env.NEXTAUTH_SECRET) missingVars.push('NEXTAUTH_SECRET')
  if (!process.env.NEXTAUTH_URL) missingVars.push('NEXTAUTH_URL')
  if (!process.env.POSTGRES_URL) missingVars.push('POSTGRES_URL')
  
  if (missingVars.length > 0) {
    console.error('[NextAuth] ERRO: Variáveis de ambiente ausentes:', missingVars)
    throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}`)
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // Log para debug em produção
        console.log('[NextAuth] Tentativa de autenticação:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        })

        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Credenciais ausentes')
          return null
        }

        // Instanciar o client do Supabase
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        try {
          // Buscar usuário no Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error) {
            console.error('[NextAuth][Supabase] Erro ao buscar usuário:', error)
            return null
          }

          if (!user) {
            console.log('[NextAuth] Usuário não encontrado')
            return null
          }

          // Verificar senha usando SHA256 (mesmo método usado nos scripts)
          const inputHash = crypto.createHash('sha256').update(credentials.password).digest('hex')
          const isPasswordValid = inputHash === user.password_hash

          console.log('[NextAuth] Validação de senha:', {
            isValid: isPasswordValid,
            userId: user.id,
            method: 'SHA256'
          })

          if (!isPasswordValid) {
            console.log('[NextAuth] Senha inválida')
            return null
          }

          // Verificar se a assinatura está ativa
          const isSubscriptionActive = user.subscription_status === 'active' && 
                                     new Date(user.subscription_expires_at) > new Date()

          console.log('[NextAuth] Status da assinatura:', {
            status: user.subscription_status,
            expiresAt: user.subscription_expires_at,
            isActive: isSubscriptionActive
          })

          // Retornar dados do usuário
          console.log('[NextAuth] Autenticação bem-sucedida para:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name
          }
        } catch (error) {
          console.error('[NextAuth] Erro na autenticação:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          })
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Temporariamente ativo para debug em produção
}

// Log de configuração (remover após resolver o problema)
console.log('[NextAuth] Configuração:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
  POSTGRES_URL: process.env.POSTGRES_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
  timestamp: new Date().toISOString()
})

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }