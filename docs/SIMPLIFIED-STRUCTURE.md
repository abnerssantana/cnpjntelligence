# Estrutura Simplificada com API MinhaReceita

## Visão Geral

A nova estrutura simplificada utiliza a API pública `minhareceita.org` para buscar dados de CNPJ em tempo real, eliminando a necessidade de importar e manter grandes volumes de dados localmente.

## Estrutura do Banco de Dados

### Tabela Principal: `empresas`
Armazena todos os dados da empresa retornados pela API:
- Dados cadastrais (CNPJ, razão social, nome fantasia)
- Endereço completo
- Informações de contato
- Dados fiscais (CNAEs, natureza jurídica, porte)
- Situação cadastral
- Opções tributárias (Simples, MEI)
- Metadados de sincronização

### Tabela: `empresa_socios`
Armazena o quadro societário (QSA):
- Nome e CPF/CNPJ do sócio
- Qualificação e data de entrada
- Faixa etária
- Representante legal (se aplicável)

### Tabela: `empresa_cnaes_secundarios`
Armazena os CNAEs secundários da empresa:
- Código CNAE
- Descrição da atividade

## Como Usar

### 1. Criar as Tabelas

```bash
npm run db:create-simplified
```

### 2. Importar um CNPJ

Para importar um ou mais CNPJs da API:

```bash
# Importar um CNPJ
npm run import-cnpj 33683111000280

# Importar múltiplos CNPJs
npm run import-cnpj 33683111000280 11222333000181 44555666000197
```

### 3. Migrar Dados Existentes

Se você já tem dados no formato antigo:

```bash
npm run migrate-data
```

## Vantagens da Nova Estrutura

1. **Simplicidade**: Uma única tabela principal com todas as informações
2. **Dados Atualizados**: Busca direto da API garante informações recentes
3. **Menor Manutenção**: Não precisa importar arquivos gigantes periodicamente
4. **Performance**: Índices otimizados para as consultas mais comuns
5. **Flexibilidade**: Fácil adicionar novos campos conforme a API evolui

## API MinhaReceita

A API é gratuita e não requer autenticação. Formato da URL:

```
https://minhareceita.org/{CNPJ}
```

Onde {CNPJ} pode ser formatado como:
- `33683111000280` (sem formatação)
- `33.683.111/0002-80` (com formatação)

### Limites de Taxa

A API tem limites de requisições. O script de importação implementa:
- Delay de 1 segundo entre requisições
- Processamento em lotes para múltiplos CNPJs
- Tratamento de erros com retry automático

## Exemplo de Uso no Código

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Buscar empresa por CNPJ
const { data: empresa } = await supabase
  .from('empresas')
  .select(`
    *,
    empresa_socios (*),
    empresa_cnaes_secundarios (*)
  `)
  .eq('cnpj', '33683111000280')
  .single();

// Buscar empresas por UF
const { data: empresas } = await supabase
  .from('empresas')
  .select('*')
  .eq('uf', 'SP')
  .eq('situacao_cadastral', 2); // Ativas

// Buscar por CNAE
const { data: empresas } = await supabase
  .from('empresas')
  .select('*')
  .eq('cnae_fiscal', 6204000);
```

## Manutenção

### Atualizar Dados

Para manter os dados atualizados, você pode:

1. **Manual**: Re-importar CNPJs específicos quando necessário
2. **Automático**: Criar um job que atualiza empresas com `last_api_sync` antigo
3. **On-demand**: Buscar da API quando o usuário solicitar

### Monitoramento

A coluna `last_api_sync` permite identificar:
- Quando os dados foram atualizados pela última vez
- Quais empresas precisam de atualização
- Histórico de sincronizações

## Migração do Sistema Antigo

1. As tabelas antigas (`companies`, `establishments`, etc.) podem coexistir
2. O script de migração busca CNPJs únicos e importa da API
3. Após validar, as tabelas antigas podem ser removidas
4. Atualizar as queries da aplicação para usar a nova estrutura