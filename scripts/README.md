# Scripts de Importação CNPJ

Este diretório contém scripts para importar dados do arquivo `base.csv` para o banco de dados Supabase.

## Arquivos

- `import-base-csv-final.js` - Script principal de importação (otimizado)
- `test-import-stream.js` - Script de teste (importa apenas 10 linhas)
- `check-tables.js` - Script para verificar estrutura das tabelas
- `package.json` - Dependências do projeto

## Pré-requisitos

1. Node.js instalado
2. Arquivo `.env.local` configurado na raiz do projeto com as variáveis do Supabase
3. Tabelas criadas no banco (execute `01-create-tables.sql` primeiro)
4. Arquivo `base.csv` no diretório `CNPJ_Matrix/`

## Instalação

```bash
cd scripts
npm install
```

## Como usar

### 1. Verificar estrutura das tabelas

```bash
node check-tables.js
```

### 2. Teste com poucas linhas (recomendado primeiro)

```bash
node test-import-stream.js
```

### 3. Importação completa

```bash
node import-base-csv-final.js
```

## Estrutura dos dados

O arquivo `base.csv` contém dados de estabelecimentos com os seguintes campos:

- CNPJ (básico, ordem, DV)
- Nome fantasia
- Situação cadastral
- Datas (situação cadastral, início atividade)
- Endereço completo
- Contatos (telefone, email)
- CNAE principal e secundário
- E outros campos...

## Performance

- Processamento em lotes de 1000 registros
- Uso de transações para garantir consistência
- Relatórios de progresso a cada 10.000 linhas
- Tratamento de erros por lote

## Tabelas afetadas

- `companies` - Dados básicos das empresas
- `establishments` - Dados dos estabelecimentos

## Observações importantes

- O script usa `ON CONFLICT DO NOTHING` para evitar duplicatas
- Empresas são criadas automaticamente se não existirem
- Datas são convertidas do formato YYYYMMDD para YYYY-MM-DD
- Campos vazios são tratados como NULL
- O script é resiliente a erros e continua processando mesmo com falhas pontuais

## Monitoramento

Durante a execução, o script exibe:
- Progresso em tempo real
- Taxa de processamento (linhas/segundo)
- Contadores de sucesso e erro
- Tempo estimado e estatísticas finais

## Troubleshooting

### Erro de conexão SSL
O script já está configurado para lidar com certificados SSL do Supabase.

### Arquivo muito grande
O script usa streams para processar arquivos grandes sem carregar tudo na memória.

### Erros de dados
Erros pontuais são logados mas não interrompem o processamento completo.