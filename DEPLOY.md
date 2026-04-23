# Deploy — NYX

Deploy de produção: **Vercel**. Infra externa: **Firebase** (Auth + Firestore) e **Cloudinary** (uploads).

---

## 1) Pré-requisitos

- Conta GitHub com o repo (ou fork) acessível
- Conta Vercel gratuita (hobby tier basta)
- Projeto Firebase criado com Auth, Firestore e regras publicadas
- Conta Cloudinary com uma cloud criada

---

## 2) Variáveis de ambiente

Ver [.env.production.example](./.env.production.example) para a lista completa e de onde tirar cada valor.

Resumo:

| Var | Fonte | Segredo? |
|-----|-------|----------|
| `NEXT_PUBLIC_SITE_URL` | URL que a Vercel gerar, depois o domínio final | Não |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número da Giovanna | Não |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 (opcional) | Não |
| `NEXT_PUBLIC_FIREBASE_*` (5 vars) | Firebase Console → Project Settings → Web app | Não (public) |
| `FIREBASE_ADMIN_PROJECT_ID` | Service account JSON → `project_id` | Sim |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account JSON → `client_email` | Sim |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account JSON → `private_key` (com `\n` literal) | Sim |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Console | Sim |
| `CLOUDINARY_API_KEY` | Cloudinary Console | Sim |
| `CLOUDINARY_API_SECRET` | Cloudinary Console | Sim |
| `SEED_SECRET` | Gerar com `openssl rand -hex 32` | Sim |

---

## 3) Deploy na Vercel

1. Em [vercel.com/new](https://vercel.com/new), importe o repo GitHub `nyx`
2. Framework detectado automaticamente: **Next.js** — aceitar defaults
3. Em **Environment Variables**, adicione as 14 vars (copiar dos valores reais)
   - Aplicar a: **Production** + **Preview** + **Development**
   - Exceção: `NEXT_PUBLIC_SITE_URL` deve ser diferente por ambiente
4. Clicar **Deploy**
5. Após o primeiro deploy, pegar a URL gerada (ex: `nyx-abc.vercel.app`) e atualizar a var `NEXT_PUBLIC_SITE_URL`, depois redeploy

---

## 4) Pós-deploy — checklist

- [ ] `/` carrega com produtos reais do Firestore
- [ ] `/produtos/[slug]` gera OG com imagem Cloudinary (testar em [opengraph.xyz](https://www.opengraph.xyz))
- [ ] `/sitemap.xml` e `/robots.txt` respondem
- [ ] `/admin/login` redireciona pra lá sem cookie (middleware funcionando)
- [ ] Login admin com a conta da Giovanna funciona
- [ ] Upload de imagem via admin grava no Cloudinary
- [ ] Audit log recebe entrada ao criar produto de teste

---

## 5) Domínio custom (quando o cliente comprar)

1. Vercel → Project → Settings → Domains → Add
2. Configurar CNAME / A record no provedor do domínio (Registro.br, GoDaddy, etc.)
3. Atualizar var `NEXT_PUBLIC_SITE_URL` pro domínio final e redeploy
4. Atualizar domínios autorizados no Firebase Auth (Authentication → Settings → Authorized domains)
5. (Opcional) Submeter sitemap no [Google Search Console](https://search.google.com/search-console)

---

## 6) Rollback

Vercel guarda todos os deploys. Em Project → Deployments, clicar nos três pontos do deploy anterior → **Promote to Production**.

---

## 7) Limitações conhecidas

- **Rate-limit em memória** (`src/lib/rate-limit.ts`): reseta a cada cold start. Para produção séria, migrar para Upstash Redis (`@upstash/ratelimit`).
- **Sem CSP**: `next.config.ts` tem HSTS/Referrer/Frame mas não CSP. Adicionar quando inventário de domínios estiver estável (GA, Cloudinary, Firebase).
- **Sem cookie banner**: obrigatório por LGPD quando o GA estiver ativo. Item pendente do backlog.
