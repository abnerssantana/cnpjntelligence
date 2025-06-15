# Correção do Erro de Autenticação em Produção

## Problema Identificado

O erro 401 (Unauthorized) em produção está ocorrendo porque as variáveis de ambiente do NextAuth não estão configuradas corretamente para o ambiente de produção.

## Solução

### 1. Configurar Variáveis de Ambiente no Vercel

Acesse o painel do Vercel e adicione as seguintes variáveis de ambiente:

```bash
# IMPORTANTE: Substitua pela URL real do seu domínio em produção
NEXTAUTH_URL=https://cnpj.navemae.digital

# IMPORTANTE: Use o mesmo secret que está no .env.local ou gere um novo
NEXTAUTH_SECRET=JudGtEIjTZ+x7R7jgiDPW4OCEACfDCemW5AKXtTitWWwIXcV6B34gsRbfW4caV8GWuQ75YRyL3bM1oxrKHL4Aw==

# Configurações do banco de dados (já devem estar configuradas)
POSTGRES_URL=postgres://postgres.wvjhemqwcawxhgqdblij:WXI5lTtPtKkNYdLx@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler
POSTGRES_USER=postgres
POSTGRES_HOST=db.wvjhemqwcawxhgqdblij.supabase.co
POSTGRES_PASSWORD=WXI5lTtPtKkNYdLx
POSTGRES_DATABASE=postgres

# Supabase
SUPABASE_URL=https://wvjhemqwcawxhgqdblij.supabase.co
SUPABASE_JWT_SECRET=JudGtEIjTZ+x7R7jgiDPW4OCEACfDCemW5AKXtTitWWwIXcV6B34gsRbfW4caV8GWuQ75YRyL3bM1oxrKHL4Aw==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2amhlbXF3Y2F3eGhncWRibGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5NjIyOCwiZXhwIjoyMDY1NTcyMjI4fQ.timRkJBcFHiwrubyiwaAgzhcsY95JuW7qFiz3qdyQro

# Public keys
NEXT_PUBLIC_SUPABASE_URL=https://wvjhemqwcawxhgqdblij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2amhlbXF3Y2F3eGhncWRibGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTYyMjgsImV4cCI6MjA2NTU3MjIyOH0.TUYIDy1BqzuL-_7ZZKmqG1OKzxTChRacR5WCvj0Ly3s
```

### 2. Passos para Configurar no Vercel

1. Acesse o dashboard do Vercel
2. Vá para o projeto `cnpjntelligence`
3. Clique em "Settings" → "Environment Variables"
4. Adicione cada variável listada acima
5. Certifique-se de que estão marcadas para "Production"
6. Clique em "Save"

### 3. Redeploy da Aplicação

Após adicionar as variáveis:
1. Vá para a aba "Deployments"
2. Clique nos três pontos do último deployment
3. Selecione "Redeploy"
4. Aguarde o deploy finalizar

### 4. Verificação Adicional

Se o erro persistir, verifique também:

1. **SSL do Banco de Dados**: O código já está configurado corretamente para usar SSL em produção:
   ```javascript
   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false }
   ```

2. **Logs de Produção**: Verifique os logs no Vercel para mais detalhes:
   - Acesse "Functions" → "Logs" no dashboard do Vercel
   - Procure por erros relacionados a `/api/auth/[...nextauth]`

### 5. Teste Local com Variáveis de Produção

Para testar localmente com as configurações de produção:

```bash
# Crie um arquivo .env.production.local
NEXTAUTH_URL=https://cnpj.navemae.digital
NODE_ENV=production

# Execute o build de produção
npm run build
npm run start
```

### 6. Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env.local` ou `.env.production` no Git
- Considere gerar um novo `NEXTAUTH_SECRET` para produção usando:
  ```bash
  openssl rand -base64 32
  ```

## Diagnóstico Adicional

Se o problema persistir após essas configurações, adicione logs temporários no arquivo `/app/api/auth/[...nextauth]/route.ts`:

```javascript
console.log('[NextAuth] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
  POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT SET'
})
```

Isso ajudará a identificar se as variáveis estão sendo carregadas corretamente em produção.