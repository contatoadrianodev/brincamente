# 🧩 BrincaMente

Plataforma de jogos educativos interativos para crianças de 3 a 12 anos.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** + **Tailwind CSS**
- **Supabase** (Auth + Database)
- **Framer Motion** (animações)
- **Recharts** (gráficos)
- **PWA** instalável no Android

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Rodar o banco de dados
# Cole o conteúdo de lib/supabase/schema.sql no Supabase SQL Editor

# 4. Iniciar servidor
npm run dev
```

## Estrutura

```
app/
  page.tsx            # Landing page
  auth/               # Login, cadastro, recuperar senha
  parent/             # Dashboard dos pais, perfis, relatórios
  child/              # Dashboard infantil, jogos, conquistas
  admin/              # Painel administrativo
components/
lib/supabase/         # Cliente Supabase + schema SQL
types/                # TypeScript types
utils/                # Gamificação, helpers
```

## Jogos disponíveis

| Jogo | Tipo | Descrição |
|------|------|-----------|
| 🧠 Jogo da Memória | `memory` | Encontrar pares de cartas |
| ❓ Quiz Educativo | `quiz` | Perguntas com 4 alternativas |
| 🎯 Arrastar e Soltar | `drag_drop` | Associar emojis às palavras |
| 🔢 Sequência Lógica | `sequence` | Completar padrões numéricos e visuais |

## Deploy na Vercel

```bash
# 1. Criar repositório no GitHub
git init
git add .
git commit -m "feat: initial BrincaMente project"
git remote add origin https://github.com/contatoadrianodev/brincamente.git
git push -u origin main

# 2. Deploy na Vercel
npx vercel --prod
# OU conectar via vercel.com/new -> importar do GitHub
```

## Variáveis de ambiente na Vercel

Configure em Settings > Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## PWA

Após o build, o app é automaticamente configurado como PWA com:
- `public/manifest.json` configurado
- Service Worker via `next-pwa`
- Instalável no Android Chrome

## Ícones PWA

Para gerar os ícones reais, use:
- https://www.pwabuilder.com/imageGenerator
- Ou https://favicon.io/favicon-generator/
- Substituir os placeholders em `public/icons/`
