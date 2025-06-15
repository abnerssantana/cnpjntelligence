import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

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

        const client = new Client({
          connectionString: process.env.POSTGRES_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false }
        })

        try {
          console.log('[NextAuth] Conectando ao banco de dados...')
          await client.connect()
          console.log('[NextAuth] Conexão estabelecida')
          
          // Buscar usuário no banco
          const query = `
            SELECT 
              id, 
              email, 
              name, 
              password_hash
            FROM app_users 
            WHERE email = $1
          `
          
          const result = await client.query(query, [credentials.email])
          
          console.log('[NextAuth] Resultado da busca:', {
            found: result.rows.length > 0,
            email: credentials.email
          })
          
          if (result.rows.length === 0) {
            console.log('[NextAuth] Usuário não encontrado')
            return null
          }
          
          const user = result.rows[0]
          
          // Verificar senha
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)
          
          console.log('[NextAuth] Validação de senha:', {
            isValid: isPasswordValid,
            userId: user.id
          })
          
          if (!isPasswordValid) {
            console.log('[NextAuth] Senha inválida')
            return null
          }
          
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
        } finally {
          await client.end()
          console.log('[NextAuth] Conexão com banco fechada')
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
  secret: process.env.NEXTAUTH_SECRET || process.env.SUPABASE_JWT_SECRET,
  debug: process.env.NODE_ENV === 'development',
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