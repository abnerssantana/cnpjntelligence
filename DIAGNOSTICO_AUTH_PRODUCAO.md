# Diagnóstico e Solução - Problema de Autenticação em Produção

## 🔍 Análise do Problema

Após revisar o código, identifiquei os principais pontos que podem estar causando o erro 401 em produção:

### 1. **Variáveis de Ambiente**
O problema mais comum é a falta ou configuração incorreta das variáveis de ambiente no Vercel.

### 2. **URL do NextAuth**
A variável `NEXTAUTH_URL` deve corresponder exatamente ao domínio em produção.

### 3. **Secret do NextAuth**
O `NEXTAUTH_SECRET` é obrigatório em produção e deve ser o mesmo usado para gerar os tokens JWT.

## 🛠️ Solução Passo a Passo

### Passo 1: Verificar Variáveis no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto `cnpjntelligence`
3. Vá para **Settings** → **Environment Variables**
4. Verifique se TODAS estas variáveis estão configuradas:

```bash
# 🔴 CRÍTICAS - Devem estar EXATAMENTE assim:
NEXTAUTH_URL=https://cnpj.navemae.digital
NEXTAUTH_SECRET=JudGtEIjTZ+x7R7jgiDPW4OCEACfDCemW5AKXtTitWWwIXcV6B34gsRbfW4caV8GWuQ75YRyL3bM1oxrKHL4Aw==

# 🟡 Banco de Dados
POSTGRES_URL=postgres://postgres.wvjhemqwcawxhgqdblij:WXI5lTtPtKkNYdLx@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler
POSTGRES_USER=postgres
POSTGRES_HOST=db.wvjhemqwcawxhgqdblij.supabase.co
POSTGRES_PASSWORD=WXI5lTtPtKkNYdLx
POSTGRES_DATABASE=postgres

# 🟢 Supabase
SUPABASE_URL=https://wvjhemqwcawxhgqdblij.supabase.co
SUPABASE_JWT_SECRET=JudGtEIjTZ+x7R7jgiDPW4OCEACfDCemW5AKXtTitWWwIXcV6B34gsRbfW4caV8GWuQ75YRyL3bM1oxrKHL4Aw==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2amhlbXF3Y2F3eGhncWRibGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5NjIyOCwiZXhwIjoyMDY1NTcyMjI4fQ.timRkJBcFHiwrubyiwaAgzhcsY95JuW7qFiz3qdyQro

# 🔵 Public Keys
NEXT_PUBLIC_SUPABASE_URL=https://wvjhemqwcawxhgqdblij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2amhlbXF3Y2F3eGhncWRibGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTYyMjgsImV4cCI6MjA2NTU3MjIyOH0.TUYIDy1BqzuL-_7ZZKmqG1OKzxTChRacR5WCvj0Ly3s
```

### Passo 2: Atualizar Configuração do NextAuth

Vou criar uma versão melhorada do arquivo de configuração do NextAuth com tratamento de erros mais robusto:

```typescript
// app/api/auth/[...nextauth]/route.ts
import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

// Validação de variáveis de ambiente
const requiredEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  POSTGRES_URL: process.env.POSTGRES_URL,
}

// Log de diagnóstico (remover após resolver)
console.log('[NextAuth] Variáveis de ambiente:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: requiredEnvVars.NEXTAUTH_URL || 'NÃO DEFINIDA',
  NEXTAUTH_SECRET: requiredEnvVars.NEXTAUTH_SECRET ? 'DEFINIDA' : 'NÃO DEFINIDA',
  POSTGRES_URL: requiredEnvVars.POSTGRES_URL ? 'DEFINIDA' : 'NÃO DEFINIDA',
  timestamp: new Date().toISOString()
})

// Verificar variáveis críticas
if (process.env.NODE_ENV === 'production') {
  if (!requiredEnvVars.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET não está definido em produção!')
  }
  if (!requiredEnvVars.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL não está definido em produção!')
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // Validação inicial
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Credenciais ausentes')
          throw new Error('Email e senha são obrigatórios')
        }

        const client = new Client({
          connectionString: process.env.POSTGRES_URL,
          ssl: process.env.NODE_ENV === 'production' 
            ? { rejectUnauthorized: false } // Mudança importante para Supabase
            : false
        })

        try {
          await client.connect()
          
          const result = await client.query(
            'SELECT id, email, name, password_hash FROM app_users WHERE email = $1',
            [credentials.email]
          )
          
          if (result.rows.length === 0) {
            throw new Error('Usuário não encontrado')
          }
          
          const user = result.rows[0]
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)
          
          if (!isPasswordValid) {
            throw new Error('Senha inválida')
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name
          }
        } catch (error) {
          console.error('[NextAuth] Erro:', error)
          throw error
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
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Temporariamente ativo para debug
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Passo 3: Verificar Logs no Vercel

1. Acesse o Vercel Dashboard
2. Vá para **Functions** → **Logs**
3. Procure por logs com `[NextAuth]` para ver os erros específicos

### Passo 4: Testar Conexão com Banco

Crie um endpoint de teste temporário:

```typescript
// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : false
  })

  try {
    await client.connect()
    const result = await client.query('SELECT NOW()')
    await client.end()
    
    return NextResponse.json({
      success: true,
      time: result.rows[0].now,
      env: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.NODE_ENV
    }, { status: 500 })
  }
}
```

### Passo 5: Configuração SSL para Supabase

⚠️ **IMPORTANTE**: Para Supabase, use `rejectUnauthorized: false` em produção:

```javascript
ssl: process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } // Necessário para Supabase
  : false
```

### Passo 6: Redeploy Completo

1. No Vercel Dashboard, vá para **Settings** → **Environment Variables**
2. Clique em **Save** mesmo que não tenha mudado nada (força reload)
3. Vá para **Deployments**
4. Clique nos 3 pontos → **Redeploy** → **Use existing Build Cache: NO**

## 🧪 Testes de Verificação

### 1. Teste de Variáveis
Acesse: `https://cnpj.navemae.digital/api/auth/providers`
Deve retornar: `{"credentials":{"name":"credentials","type":"credentials"}}`

### 2. Teste de Banco
Acesse: `https://cnpj.navemae.digital/api/test-db`
Deve retornar sucesso com timestamp

### 3. Teste de Login
Use as credenciais de teste no formulário de login

## 🚨 Checklist de Resolução

- [ ] Todas as variáveis de ambiente estão configuradas no Vercel
- [ ] NEXTAUTH_URL está com https://cnpj.navemae.digital (sem barra no final)
- [ ] NEXTAUTH_SECRET está definido e é o mesmo do .env.local
- [ ] SSL do banco está com rejectUnauthorized: false
- [ ] Redeploy foi feito sem cache
- [ ] Logs do Vercel foram verificados
- [ ] Teste de conexão com banco funciona
- [ ] Login funciona em produção

## 📝 Notas Adicionais

1. **Cookies**: O NextAuth usa cookies seguros em produção. Certifique-se de que o domínio está com HTTPS.

2. **CORS**: Não deve ser um problema já que tudo está no mesmo domínio.

3. **Timeout**: As funções do Vercel têm timeout de 10s por padrão. O arquivo vercel.json já está configurado para 30s.

4. **Cache**: Limpe o cache do navegador ao testar.

## 🆘 Se o Problema Persistir

1. Ative o modo debug temporariamente:
   ```javascript
   debug: true, // em authOptions
   ```

2. Adicione mais logs no componente de login

3. Verifique se o usuário existe no banco:
   ```sql
   SELECT email, name FROM app_users WHERE email = 'seu-email-teste';
   ```

4. Considere criar um novo NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

5. Entre em contato com o suporte do Vercel se necessário

---

**Última atualização**: Janeiro 2025