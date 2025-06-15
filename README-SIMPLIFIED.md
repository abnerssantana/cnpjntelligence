# CNPJntelligence - Implementação Simplificada

## 🚀 Nova Arquitetura

A plataforma foi reescrita para usar a API pública `minhareceita.org`, simplificando drasticamente a estrutura e manutenção do sistema.

### Principais Mudanças

1. **Fonte de Dados**: API em tempo real ao invés de importação de arquivos
2. **Estrutura Simplificada**: 3 tabelas principais ao invés de múltiplas tabelas normalizadas
3. **Dados Sempre Atualizados**: Busca direto da Receita Federal via API
4. **Menor Complexidade**: Código mais simples e fácil de manter

## 📦 Instalação

### 1. Instalar Dependências

```bash
npm install axios --legacy-peer-deps
```

### 2. Criar Tabelas no Banco

```bash
npm run db:create-simplified
```

### 3. Configurar Variáveis de Ambiente

Certifique-se de ter as seguintes variáveis no `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
DATABASE_URL=your_database_url
```

## 🔧 Uso

### Importar CNPJs

```bash
# Um CNPJ
npm run import-cnpj 33683111000280

# Múltiplos CNPJs
npm run import-cnpj 33683111000280 11222333000181
```

### Migrar Dados Existentes

Se você tem dados no formato antigo:

```bash
npm run migrate-data
```

### Usar no Código

```typescript
import { getEmpresaByCNPJ, searchEmpresas } from '@/lib/api/cnpj';

// Buscar por CNPJ
const empresa = await getEmpresaByCNPJ('33683111000280');

// Pesquisar empresas
const results = await searchEmpresas({
  uf: 'SP',
  situacao_cadastral: 2, // Ativas
  limit: 20
});
```

## 🏗️ Estrutura do Banco

### Tabela: empresas
- Todos os dados da empresa em uma única tabela
- Índices otimizados para consultas comuns
- Metadados de sincronização

### Tabela: empresa_socios
- Quadro societário (QSA)
- Relacionamento 1:N com empresas

### Tabela: empresa_cnaes_secundarios
- CNAEs secundários
- Relacionamento 1:N com empresas

## 🎯 Componentes UI

### CNPJSearch Component

```tsx
import { CNPJSearch } from '@/components/cnpj/cnpj-search';

export default function Page() {
  return <CNPJSearch />;
}
```

## 📊 API Endpoints

A API `minhareceita.org` é gratuita e não requer autenticação:

- **URL Base**: `https://minhareceita.org`
- **Formato**: `/{CNPJ}` (com ou sem formatação)
- **Limite**: ~3 requisições por segundo

## 🔄 Estratégias de Cache

1. **Cache Local**: Dados são salvos no banco com timestamp
2. **Revalidação**: Dados são atualizados após 7 dias
3. **Fallback**: Se API falhar, retorna dados em cache

## 🚦 Próximos Passos

1. **Dashboard**: Atualizar para usar nova estrutura
2. **Relatórios**: Adaptar queries existentes
3. **Webhooks**: Implementar atualização automática
4. **Analytics**: Adicionar métricas de uso da API

## 📝 Notas Importantes

- A API é pública e gratuita, mas tem limites de taxa
- Dados são da base pública da Receita Federal
- CPFs são parcialmente mascarados por privacidade
- Atualizações podem ter delay de alguns dias

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request