# 🚀 Comandos de Deploy – BrincaMente

## 1. Instalar dependências (rode na pasta do projeto)
```bash
npm install
```

## 2. Criar repositório no GitHub
```bash
# Na pasta brincamente:
git init
git add .
git commit -m "feat: BrincaMente - plataforma educativa infantil completa"
git branch -M main
git remote add origin https://github.com/contatoadrianodev/brincamente.git
git push -u origin main
```

> ⚠️ Primeiro crie o repositório em: https://github.com/new
> Nome sugerido: `brincamente`

## 3. Deploy na Vercel

### Opção A – Via CLI (recomendado)
```bash
npm install -g vercel
vercel login
vercel --prod
```
> Quando perguntar sobre conta, escolha: `contatoadrianodev-8019`

### Opção B – Via painel web
1. Acesse https://vercel.com/new
2. Importe o repositório `contatoadrianodev/brincamente`
3. Configure as variáveis de ambiente (veja abaixo)
4. Clique em Deploy

## 4. Variáveis de ambiente na Vercel
Configure em: https://vercel.com/contatoadrianodev-8019/brincamente/settings/environment-variables

```
NEXT_PUBLIC_SUPABASE_URL       = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
SUPABASE_SERVICE_ROLE_KEY      = eyJ...
```

## 5. Banco de dados (Supabase)
1. Crie um projeto em https://supabase.com/dashboard
2. Vá em SQL Editor
3. Cole e execute todo o conteúdo de: `lib/supabase/schema.sql`

## 6. Commit para novas alterações
```bash
git add .
git commit -m "feat: descrição das alterações"
git push
```
> A Vercel fará o redeploy automático após cada push para `main`

## 7. URLs do projeto (após deploy)
- Site: https://brincamente.vercel.app (ou domínio configurado)
- Área dos pais: /parent/dashboard
- Jogos: /child/select-profile
- Admin: /admin/dashboard
