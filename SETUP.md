# Guia de Configuração - CNPJntelligence

Este guia irá ajudá-lo a configurar o projeto sem precisar do PostgreSQL instalado localmente.

## 📋 Pré-requisitos

- Node.js 18 ou superior
- Conta no Supabase (gratuita)
- Git

## 🚀 Passo a Passo

### 1. Clone o Projeto

```bash
git clone https://github.com/seu-usuario/cnpjntelligence.git
cd cnpjntelligence
```

### 2. Instale as Dependências

```bash
npm install --legacy-peer-deps
```

### 3. Configure o Supabase

1. Crie uma conta gratuita em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as seguintes informações:
   - Project URL
   - Anon Key
   - Service Role Key
   - Database URL

### 4. Configure as Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:

```env
# Database (pegue do Supabase -> Settings -> Database)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase (pegue do Supabase -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-uma-chave-secreta-aleatoria-aqui
```

### 5. Configure o Banco de Dados

#### Opção A: Via Supabase SQL Editor (Recomendado)

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Clique em "New Query"
4. Copie todo o conteúdo do arquivo `scripts/setup-complete.sql`
5. Cole no editor e clique em "Run"

#### Opção B: Via Script Node.js

Se você tem o PostgreSQL instalado localmente:
```bash
npm run db:setup
```

Se não tem o PostgreSQL instalado:
```bash
npm run db:setup-supabase
```

### 6. Crie um Usuário Administrador

```bash
npm run create-admin
```

Siga as instruções:
- Email padrão: admin@cnpjntelligence.com
- Senha padrão: admin123

### 7. Inicie o Servidor

```bash
npm run dev
```

Acesse http://localhost:3000

## 🔧 Solução de Problemas

### Erro: "psql: command not found"

Este erro ocorre porque o PostgreSQL não está instalado. Use uma das seguintes soluções:

1. **Via Supabase Dashboard** (Recomendado):
   - Acesse o SQL Editor no Supabase
   - Execute o conteúdo de `scripts/setup-complete.sql`

2. **Instalar PostgreSQL** (Opcional):
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql-client

   # Windows
   # Baixe de https://www.postgresql.org/download/windows/
   ```

### Erro de Conexão com o Banco

1. Verifique se as variáveis de ambiente estão corretas
2. Certifique-se de que o projeto Supabase está ativo
3. Verifique se o IP está liberado no Supabase (Settings -> Database -> Connection Pooling)

### Erro ao Criar Usuário

1. Certifique-se de que a tabela `app_users` foi criada
2. Verifique as credenciais do banco de dados
3. Tente executar o script novamente

## 📝 Próximos Passos

1. **Importar CNPJs**:
   ```bash
   npm run import-cnpj 33683111000280
   ```

2. **Acessar o Dashboard**:
   - Faça login com as credenciais criadas
   - Busque empresas por CNPJ ou razão social

3. **Personalizar**:
   - Modifique o tema em `tailwind.config.ts`
   - Adicione novos componentes em `components/`
   - Estenda a API em `lib/api/`

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do console
2. Consulte a documentação do Supabase
3. Abra uma issue no GitHub

## 📚 Recursos Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do NextAuth.js](https://next-auth.js.org)
- [API MinhaReceita](https://minhareceita.org)