# 🚀 Verificação Rápida - Autenticação em Produção

## 1️⃣ Configurar Variáveis no Vercel

### Acesse o Vercel e adicione estas variáveis:

```bash
NEXTAUTH_URL=https://cnpj.navemae.digital
NEXTAUTH_SECRET=JudGtEIjTZ+x7R7jgiDPW4OCEACfDCemW5AKXtTitWWwIXcV6B34gsRbfW4caV8GWuQ75YRyL3bM1oxrKHL4Aw==
```

⚠️ **IMPORTANTE**: 
- Sem barra (/) no final da URL
- Use exatamente o mesmo secret do desenvolvimento

## 2️⃣ Deploy as Mudanças

```bash
git add .
git commit -m "fix: corrigir SSL para Supabase e adicionar logs de debug"
git push
```

## 3️⃣ Testes de Verificação

### Teste 1: Verificar Configuração
```
https://cnpj.navemae.digital/api/test-db
```

Deve retornar:
- ✅ success: true
- ✅ database.connected: true
- ✅ nextauth.urlConfigured: true
- ✅ nextauth.secretConfigured: true

### Teste 2: Verificar Providers
```
https://cnpj.navemae.digital/api/auth/providers
```

Deve retornar:
```json
{"credentials":{"name":"credentials","type":"credentials"}}
```

### Teste 3: Fazer Login
Tente fazer login normalmente em:
```
https://cnpj.navemae.digital/login
```

## 4️⃣ Verificar Logs

1. No Vercel Dashboard
2. Vá para **Functions** → **Logs**
3. Procure por mensagens com `[NextAuth]` ou `[Test-DB]`

## 5️⃣ Se Ainda Não Funcionar

### Opção A: Forçar Redeploy
1. No Vercel, vá para **Settings** → **Environment Variables**
2. Edite qualquer variável (adicione um espaço e remova)
3. Salve
4. Vá para **Deployments** → **Redeploy**

### Opção B: Verificar Domínio
Confirme que o domínio está correto:
```bash
curl https://cnpj.navemae.digital
```

### Opção C: Limpar Cache
1. No navegador: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
2. Ou abra em janela anônima/privada

## ✅ Checklist Final

- [ ] Variáveis configuradas no Vercel
- [ ] Deploy feito com as correções
- [ ] Teste de banco retorna sucesso
- [ ] Teste de providers funciona
- [ ] Login funciona em produção

---

💡 **Dica**: Após resolver, remova o `debug: true` do NextAuth para não expor logs em produção.