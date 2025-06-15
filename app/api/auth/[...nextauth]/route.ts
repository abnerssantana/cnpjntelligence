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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Configuração SSL para evitar erro de certificado auto-assinado
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        
        const client = new Client({
          connectionString: process.env.POSTGRES_URL
        })

        try {
          await client.connect()
          
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
          
          if (result.rows.length === 0) {
            return null
          }
          
          const user = result.rows[0]
          
          // Verificar senha
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)
          
          if (!isPasswordValid) {
            return null
          }
          
          // Retornar dados do usuário
          return {
            id: user.id,
            email: user.email,
            name: user.name
          }
        } catch (error) {
          console.error('Erro na autenticação:', error)
          return null
        } finally {
          await client.end()
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
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }