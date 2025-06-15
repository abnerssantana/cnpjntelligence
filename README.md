# CNPJntelligence

Plataforma simplificada para consulta de dados de empresas brasileiras usando a API pública da Receita Federal.

## 🚀 Características

- ✅ Consulta de CNPJ em tempo real via API
- ✅ Interface limpa e moderna
- ✅ Sistema de autenticação seguro
- ✅ Dashboard com estatísticas
- ✅ Busca por CNPJ ou razão social
- ✅ Visualização completa de dados empresariais

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Conta no Supabase (para o banco de dados)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/cnpjntelligence.git
cd cnpjntelligence
```

2. Instale as dependências:
```bash
npm install --legacy-peer-deps
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_URL=postgresql://user:password@host:port/database

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

4. Crie as tabelas no banco de dados:
```bash
# Tabelas principais
npm run db:create-tables

# Tabela de usuários
npm run db:create-users
```

5. Crie um usuário administrador:
```bash
npm run create-admin
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📖 Uso

### Importar CNPJs

Para importar dados de empresas:

```bash
# Um CNPJ
npm run import-cnpj 33683111000280

# Múltiplos CNPJs
npm run import-cnpj 33683111000280 11222333000181
```

### Acessar a Plataforma

1. Acesse http://localhost:3000
2. Clique em "Entrar"
3. Use as credenciais criadas com `npm run create-admin`
4. No dashboard, você pode:
   - Buscar empresas por CNPJ ou razão social
   - Ver estatísticas gerais
   - Visualizar dados completos das empresas

## 🏗️ Estrutura do Projeto

```
cnpjntelligence/
├── app/                    # Páginas e rotas Next.js
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard principal
│   └── login/             # Página de login
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (shadcn/ui)
│   └── dashboard-simple.tsx # Dashboard principal
├── lib/                   # Utilitários e configurações
│   └── api/              # Funções da API
├── scripts/              # Scripts de banco de dados
└── types/                # Definições TypeScript
```

## 🔐 Segurança

- Autenticação via NextAuth.js
- Senhas criptografadas com bcrypt
- Sessões JWT seguras
- Middleware de proteção de rotas

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Autenticação**: NextAuth.js
- **Banco de Dados**: PostgreSQL (Supabase)
- **API**: MinhaReceita.org

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run start` - Inicia o servidor de produção
- `npm run create-admin` - Cria usuário administrador
- `npm run import-cnpj` - Importa dados de CNPJ
- `npm run db:create-tables` - Cria tabelas do banco
- `npm run db:create-users` - Cria tabela de usuários

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.