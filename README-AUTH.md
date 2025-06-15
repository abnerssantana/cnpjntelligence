# Autenticação - CNPJ Intelligence

Este documento descreve o sistema de autenticação implementado usando NextAuth.js.

## Visão Geral

O sistema usa NextAuth.js (Auth.js) com autenticação baseada em credenciais (email/senha) e armazenamento no PostgreSQL.

## Componentes Principais

### 1. Configuração do NextAuth
- **Arquivo**: `/app/api/auth/[...nextauth]/route.ts`
- **Provider**: Credentials (email/senha)
- **Estratégia de Sessão**: JWT
- **Duração da Sessão**: 30 dias

### 2. Tabela de Usuários
- **Nome**: `app_users`
- **Campos**:
  - `id`: UUID único
  - `email`: Email único do usuário
  - `name`: Nome completo
  - `password_hash`: Hash bcrypt da senha
  - `subscription_status`: Status da assinatura (trial/active/inactive)
  - `subscription_expires_at`: Data de expiração
  - `created_at`: Data de criação
  - `updated_at`: Data de atualização

### 3. Middleware de Proteção
- **Arquivo**: `/middleware.ts`
- Protege todas as rotas exceto:
  - `/login`
  - `/api/auth/*`
  - Arquivos estáticos
- Redireciona para `/subscription` se a assinatura expirou

### 4. Componentes de UI

#### UserNav
- **Arquivo**: `/components/auth/user-nav.tsx`
- Menu dropdown com informações do usuário
- Opções: Assinatura, Configurações, Logout

#### AuthProvider
- **Arquivo**: `/components/providers/auth-provider.tsx`
- Provider que envolve toda a aplicação

#### Página de Login
- **Arquivo**: `/app/login/page.tsx`
- Formulário de login com validação
- Feedback de erro e loading states

#### Página de Assinatura
- **Arquivo**: `/app/subscription/page.tsx`
- Mostra status da assinatura
- Planos disponíveis (em breve)

### 5. Hook Personalizado
- **Arquivo**: `/hooks/use-auth.ts`
- Hook para verificar autenticação
- Retorna: user, isLoading, isAuthenticated, isSubscriptionActive

## Fluxo de Autenticação

1. **Login**:
   - Usuário acessa `/login`
   - Insere email e senha
   - NextAuth valida credenciais no banco
   - Verifica hash bcrypt da senha
   - Cria sessão JWT com dados do usuário

2. **Proteção de Rotas**:
   - Middleware verifica token JWT
   - Se não autenticado → redireciona para `/login`
   - Se autenticado mas assinatura expirada → redireciona para `/subscription`

3. **Logout**:
   - Usuário clica em "Sair"
   - Sessão é destruída
   - Redireciona para `/login`

## Segurança

- **Senhas**: Hash bcrypt com salt (10 rounds)
- **Sessões**: JWT assinado com secret
- **HTTPS**: Requerido em produção
- **Validação**: Email e senha forte obrigatórios

## Usuário Admin Padrão

- **Email**: `admin@cnpjntelligence.com`
- **Senha**: `Admin@123456`
- **⚠️ IMPORTANTE**: Altere a senha após o primeiro login!

## Scripts de Gerenciamento

### Criar/Atualizar Admin
```bash
cd scripts
node create-admin-user.js
```

### Gerenciar Usuários
```bash
cd scripts
node manage-users.js
```

### Listar Usuários
```bash
cd scripts
node list-users.js
```

## Variáveis de Ambiente

Adicione ao `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_secret_aqui
```

Em produção:
- Altere `NEXTAUTH_URL` para a URL do seu domínio
- Use um `NEXTAUTH_SECRET` forte e único

## Integração no Frontend

### Verificar Autenticação
```typescript
import { useSession } from "next-auth/react"

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <Loading />
  if (!session) return <NotAuthenticated />
  
  return <div>Olá, {session.user.name}!</div>
}
```

### Usar Hook Personalizado
```typescript
import { useAuth } from "@/hooks/use-auth"

function MyComponent() {
  const { user, isLoading, isSubscriptionActive } = useAuth()
  
  if (!isSubscriptionActive) {
    return <SubscriptionExpired />
  }
  
  // ...
}
```

### Login Programático
```typescript
import { signIn } from "next-auth/react"

const handleLogin = async () => {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  })
  
  if (result?.ok) {
    router.push("/dashboard")
  }
}
```

## Próximos Passos

1. **Recuperação de Senha**: Implementar fluxo de reset
2. **2FA**: Adicionar autenticação de dois fatores
3. **OAuth**: Adicionar login social (Google, GitHub)
4. **Logs de Auditoria**: Registrar ações dos usuários
5. **Rate Limiting**: Prevenir ataques de força bruta

## Troubleshooting

### Erro de Login
- Verifique se o email existe no banco
- Confirme que a senha está correta
- Verifique logs do servidor para erros

### Sessão Expirando
- Aumente `maxAge` na configuração
- Verifique configuração de cookies

### Middleware não Funcionando
- Certifique-se que o arquivo está em `/middleware.ts`
- Verifique o matcher no config

### Erro de Conexão com Banco
- Confirme variáveis de ambiente
- Teste conexão diretamente