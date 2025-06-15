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

> **Nota**: Se você não tem o PostgreSQL instalado, consulte o [Guia de Configuração Completo](SETUP.md) para instruções detalhadas.

### Instalação Rápida

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
# Edite .env.local com suas credenciais do Supabase
```

4. Configure o banco de dados:

**Opção 1 - Via Supabase Dashboard (Recomendado):**
- Acesse o SQL Editor no Supabase
- Execute o conteúdo de `scripts/setup-complete.sql`

**Opção 2 - Via Script:**
```bash
npm run db:setup-supabase
```

5. Crie um usuário administrador:
```bash
npm run create-admin
```

6. Inicie o servidor:
```bash
npm run dev
```

Para instruções detalhadas e solução de problemas, consulte o [Guia de Configuração](SETUP.md).

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
- `npm run db:setup` - Configura banco de dados (requer PostgreSQL)
- `npm run db:setup-supabase` - Configura banco via Supabase

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.