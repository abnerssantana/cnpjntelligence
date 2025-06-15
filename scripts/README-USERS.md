# Gerenciamento de Usuários - CNPJ Intelligence

Este documento descreve como gerenciar usuários no sistema CNPJ Intelligence.

## Scripts Disponíveis

### 1. create-admin-user.js
Script para criar o usuário administrador inicial do sistema.

**Como usar:**
```bash
cd scripts
node create-admin-user.js
```

**Detalhes:**
- Email padrão: `admin@cnpjntelligence.com`
- Senha padrão: `Admin@123456`
- **IMPORTANTE:** Altere a senha após o primeiro login!

### 2. manage-users.js
Script interativo completo para gerenciar usuários.

**Como usar:**
```bash
cd scripts
node manage-users.js
```

**Funcionalidades:**
1. **Listar usuários** - Mostra todos os usuários cadastrados
2. **Criar novo usuário** - Adiciona um novo usuário ao sistema
3. **Atualizar usuário** - Modifica dados de um usuário existente
4. **Deletar usuário** - Remove um usuário do sistema

## Estrutura da Tabela Users

A tabela `users` possui os seguintes campos:

- `id` - UUID único do usuário
- `email` - Email do usuário (único)
- `name` - Nome completo
- `password_hash` - Hash SHA256 da senha
- `subscription_status` - Status da assinatura (trial/active/inactive)
- `subscription_expires_at` - Data de expiração da assinatura
- `created_at` - Data de criação
- `updated_at` - Data da última atualização

## Requisitos de Senha

As senhas devem atender aos seguintes requisitos:
- Mínimo de 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número

## Níveis de Assinatura

- **trial** - Período de teste
- **active** - Assinatura ativa
- **inactive** - Assinatura inativa/expirada

## Segurança

1. As senhas são armazenadas como hash SHA256
2. Nunca armazene senhas em texto plano
3. Use senhas fortes para contas administrativas
4. Revise regularmente os acessos dos usuários

## Integração com a Aplicação

Para integrar a autenticação de usuários na aplicação Next.js:

1. Use a tabela `users` para autenticação
2. Verifique o `password_hash` ao fazer login
3. Valide `subscription_expires_at` para controle de acesso
4. Use o `subscription_status` para features específicas

## Exemplo de Uso no Código

```javascript
// Verificar credenciais
const crypto = require('crypto');

function verifyPassword(inputPassword, storedHash) {
  const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
  return inputHash === storedHash;
}

// Verificar assinatura ativa
function isSubscriptionActive(user) {
  return user.subscription_status === 'active' && 
         new Date(user.subscription_expires_at) > new Date();
}
```

## Troubleshooting

### Erro de conexão
- Verifique se o arquivo `.env.local` existe e tem as credenciais corretas
- Confirme que o banco de dados está acessível

### Usuário admin já existe
- O script perguntará se deseja atualizar a senha
- Use o `manage-users.js` para outras modificações

### Senha não aceita
- Certifique-se de que atende aos requisitos mínimos
- Use letras maiúsculas, minúsculas e números

## Manutenção

- Execute backups regulares da tabela `users`
- Monitore usuários inativos
- Implemente política de expiração de senha em produção
- Configure logs de auditoria para ações administrativas