# Configuração do CNPJntelligence no Vercel

## 🚀 Guia Completo de Deploy

### 1. Preparação do Projeto

O projeto já foi configurado com as seguintes correções de segurança:
- ✅ Removida a configuração insegura `NODE_TLS_REJECT_UNAUTHORIZED = '0'`
- ✅ Implementada configuração SSL adequada para produção
- ✅ Adicionado arquivo `vercel.json` com configurações otimizadas

### 2. Variáveis de Ambiente no Vercel

No painel do Vercel, configure as seguintes variáveis de ambiente:

#### 🔐 Banco de Dados (Supabase)
```
POSTGRES_URL=postgres://postgres.wvjhemqwcawxhgqdblij:WXI5lTtPtKkNYdLx@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler
POSTGRES_URL_NON_POOLING=postgres://postgres.wvjhemqwcawxhgqdblij:WXI5lTtPtKkNYdLx@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_USER=postgres
POSTGRES_HOST=db.wvjhemqwcawxhgqdblij.supabase.co
POSTGRES_PASSWORD=WXI5lTtPtKkNYdLx
POSTGRES_DATABASE=postgres
POSTGRES_PORT=5432
```

#### 🔑 Supabase API
```
SUPABASE_URL=https://wvjhemqwcawxhgqdblij.supabase.co
SUPABASE_JWT_SECRET=JudGtEIjTZ+x7R7jgiDPW4OCEACfDCemW5AKXtTitWWwIXcV6B34gsRbfW4caV8GWuQ75YRyL3bM1oxrKHL4Aw==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2amhlbXF3Y2F3eGhncWRibGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5NjIyOCwiZXhwIjoyMDY1NTcyMjI4fQ.timRkJBcFHiwrubyiwaAgzhcsY95JuW7qFiz3qdyQro
```

#### 🌐 Next.js Public
```
NEXT_PUBLIC_SUPABASE_URL=https://wvjhemqwcawxhgqdblij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2amhlbXF3Y2F3eGhncWRibGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTYyMjgsImV4cCI6MjA2NTU3MjIyOH0.TUYIDy1BqzuL-_7ZZKmqG1OKzxTChRacR5WCvj0Ly3s
```

#### 🔐 NextAuth.js
```
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=JudGtEIjTZ+x7R7jgiDPW4OCEACfDCemW5AKXtTitWWwIXcV6B34gsRbfW4caV8GWuQ75YRyL3bM1oxrKHL4Aw==
```

**⚠️ IMPORTANTE:** Substitua `https://seu-dominio.vercel.app` pela URL real do seu projeto no Vercel.

### 3. Configuração Passo a Passo no Vercel

#### 3.1 Deploy Inicial
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente listadas acima
3. Faça o deploy inicial

#### 3.2 Configuração do Banco de Dados
Após o primeiro deploy, execute os seguintes comandos localmente para configurar o banco:

```bash
# 1. Configure as variáveis de ambiente localmente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 2. Configure o banco de dados (via Supabase SQL Editor)
# Copie e execute o conteúdo de scripts/setup-complete.sql no Supabase

# 3. Crie um usuário administrador
npm run create-admin
```

#### 3.3 Verificação do Deploy
1. Acesse sua URL do Vercel
2. Teste o login com as credenciais criadas
3. Verifique se o dashboard carrega corretamente
4. Teste a importação de um CNPJ

### 4. Configurações de Segurança Implementadas

#### 4.1 SSL/TLS
- ✅ Configuração SSL adequada para produção
- ✅ Certificados válidos em produção
- ✅ Fallback seguro para desenvolvimento local

#### 4.2 NextAuth.js
- ✅ Secret configurado adequadamente
- ✅ URL de produção configurada
- ✅ Sessões JWT com expiração de 30 dias
- ✅ Páginas de login e erro personalizadas

#### 4.3 Middleware de Proteção
- ✅ Proteção de rotas do dashboard
- ✅ Redirecionamento automático para login
- ✅ Prevenção de acesso não autorizado

### 5. Funcionalidades do Sistema de Login

#### 5.1 Autenticação
- **Método:** Credentials Provider (email/senha)
- **Criptografia:** bcryptjs com salt rounds 10
- **Sessão:** JWT com 30 dias de validade
- **Banco:** PostgreSQL via Supabase

#### 5.2 Fluxo de Autenticação
1. Usuário acessa `/login`
2. Insere email e senha
3. Sistema valida no banco `app_users`
4. Cria sessão JWT
5. Redireciona para `/dashboard`

#### 5.3 Proteção de Rotas
- **Públicas:** `/`, `/login`, `/auth/*`
- **Protegidas:** `/dashboard/*`
- **Middleware:** Verifica token JWT automaticamente

### 6. Troubleshooting

#### 6.1 Erro de Conexão SSL
Se encontrar erros de SSL em produção:
```bash
# Verifique se NEXTAUTH_URL está correto
# Deve ser https://seu-dominio.vercel.app
```

#### 6.2 Erro de Autenticação
```bash
# Verifique se o usuário admin foi criado
# Execute: npm run create-admin
```

#### 6.3 Erro de Banco de Dados
```bash
# Verifique se as tabelas foram criadas
# Execute o SQL do arquivo scripts/setup-complete.sql no Supabase
```

### 7. Monitoramento

#### 7.1 Logs do Vercel
- Acesse Functions → View Function Logs
- Monitore erros de autenticação
- Verifique conexões com banco

#### 7.2 Supabase Dashboard
- Monitore conexões ativas
- Verifique logs de queries
- Acompanhe uso de recursos

### 8. Próximos Passos

Após o deploy bem-sucedido:

1. **Teste completo do sistema**
2. **Configure domínio personalizado** (opcional)
3. **Configure monitoramento** (Sentry, LogRocket, etc.)
4. **Implemente backup automático** do banco
5. **Configure CI/CD** para deploys automáticos

### 9. Suporte

Em caso de problemas:
1. Verifique os logs do Vercel
2. Consulte o Supabase Dashboard
3. Teste localmente primeiro
4. Verifique todas as variáveis de ambiente

---

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] NEXTAUTH_URL atualizada com domínio de produção
- [ ] Banco de dados configurado (tabelas criadas)
- [ ] Usuário admin criado
- [ ] Deploy realizado com sucesso
- [ ] Login testado em produção
- [ ] Dashboard acessível
- [ ] Importação de CNPJ funcionando

---

**🎉 Seu sistema CNPJntelligence está pronto para produção!**