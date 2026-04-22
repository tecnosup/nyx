# Contexto do Projeto NYX

> Documento de referência para o Claude. Após `/clear`, basta pedir "olhe o PROJECT_CONTEXT.md" para recuperar todo o contexto.

## Sobre o projeto

NYX é uma landing page + e-commerce de streetwear da cliente **Giovana**, que trabalha com **drops exclusivos** (compra pequenas quantidades de peças de vários fornecedores e revende como edições limitadas). Desenvolvido pela agência Tecnosup.

- **Localização:** `C:\Users\cardo\nyx`
- **Cliente final:** Giovana (dona da NYX)
- **Dev/Agência:** Tecnosup (Abraão)

## Branding

- **Logo:** "NYX." em tipografia serifada clássica (cinza escuro sobre fundo claro)
- **Paleta monocromática:**
  - `#fefbef` — fundo off-white quente (cor principal)
  - `#545454` — ink, texto principal
  - `#737373` — muted
  - `#a6a6a6` — soft
  - `#d9d9d9` — linhas/bordas
  - `#b4b4b4` — stone
  - `#eaeae4` — cream
- **Tipografia:**
  - Títulos: **Cormorant Garamond** (serifada elegante, peso 300–700)
  - Corpo: **Inter** (sans-serif)
- **Tom de voz:** streetwear, minimalista, moda
- **Referência visual:** https://lojabasique.com.br/ (grid limpo, foco no produto)

## Stack técnica

- **Next.js 15.1.6** (App Router) + TypeScript
- **React 19**
- **TailwindCSS 3.4** (tema NYX já configurado)
- **Firebase** (Auth + Firestore + Storage + Hosting) — hospedagem gratuita
- **Framer Motion** para animações
- **Lucide React** para ícones
- **React Hook Form + Zod** para formulários e validação
- **clsx + tailwind-merge** para composição de classes
- **next-seo** para SEO

## Decisões de arquitetura

1. **Checkout via WhatsApp em DUAS FASES:**
   - Fase 1 (MVP): link `wa.me` com mensagem pré-preenchida
   - Fase 2 (futuro): WhatsApp Cloud API oficial com bot automatizado
   - Estrutura já deve ser preparada para a Fase 2

2. **Pagamento:** combinado no WhatsApp (sem gateway integrado)

3. **Frete:** valor fixo, combinado via WhatsApp

4. **Estoque:** gerenciado no cadastro do produto, sem sistema de reserva complexo

5. **Admin:** 2 contas (Giovana + Tecnosup), sem 2FA

6. **Segurança desde o dia 1:**
   - Firestore Security Rules rigorosas
   - Custom claims para role admin
   - Middleware protegendo `/admin/*`
   - Zod validation cliente + servidor
   - Rate limiting em checkout
   - Headers (CSP, HSTS, X-Frame-Options) em `next.config.ts`

## Variáveis de ambiente

- `NEXT_PUBLIC_WHATSAPP_NUMBER=5512981646555` (número da Giovana)
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXT_PUBLIC_SITE_NAME=NYX`
- Firebase: ainda não configurado (próximo bloco)

## Plano de desenvolvimento em blocos

- [x] **Bloco 1** — Fundação: landing base, Hero, Manifesto, Navbar, Footer, design tokens
- [x] **Bloco 2** — Catálogo público: grid responsivo, PDP com galeria, drops, badges, categorias (mock em `src/lib/mock-products.ts`, Firestore ainda não plugado)
- [x] **Bloco 3** — Checkout via `wa.me`: formulário validado (Zod), `buildWhatsAppMessage` em `src/lib/whatsapp.ts`, rate-limit em `src/lib/rate-limit.ts`
- [x] **Bloco 3.5** — Rework visual FLOWBIT/REPRESENT: produto-herói em vinheta, grid ghost, PDP 3-col, size-pills, cta-pill (branch `bloco-3.5-visual`, commit `1e5f126`)
- [ ] **Bloco 4** — Admin: Firebase Auth (Giovana + Tecnosup, custom claims), dashboard, CRUD de produtos com upload pro Storage, gestão de drops, estoque, logs de auditoria, Firestore Security Rules rigorosas, middleware em `/admin/*`
- [ ] **Bloco 5** — Polish: SEO dinâmico, Open Graph por produto, contador regressivo do próximo drop, Google Analytics, deploy Firebase Hosting, Cloud API

### Pendente opcional no Bloco 3.5 (antes de mergear)

- Seção "Selecionados" na landing entre `<Manifesto />` e `<section id="drops">` — grid 4-col estilo REPRESENT mostrando 4 produtos curados (reusar `ProductCard` + `ProductGrid` ou inline). Fecha a identidade visual e dá preview do catálogo.

## Estrutura esperada

```
nyx/
├── src/
│   ├── app/
│   │   ├── (public)/              ← ROUTE GROUP com parênteses
│   │   │   ├── layout.tsx         (importa Navbar + Footer)
│   │   │   └── page.tsx           (Hero + Manifesto + "Drops em breve")
│   │   ├── globals.css            (Tailwind + tokens NYX)
│   │   └── layout.tsx             (RootLayout com fontes + metadata SEO)
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx           (fullscreen, tipografia gigante, Framer Motion)
│   │   │   └── Manifesto.tsx
│   │   └── shared/
│   │       ├── Navbar.tsx         (fixa, transparente → blur ao rolar, menu mobile)
│   │       └── Footer.tsx         (3 colunas: brand, navegação, contato)
│   └── lib/
│       ├── constants.ts           (SITE_CONFIG, NAVIGATION, PRODUCT_CATEGORIES)
│       └── utils.ts               (cn, formatPrice, slugify)
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Regras de trabalho

- Sempre mostrar o que vai fazer antes de mudanças grandes
- Preferir editar arquivos existentes vs recriar do zero
- Não reinstalar dependências sem perguntar
- Avisar se houver inconsistência entre o doc e o código real
- Resumo curto ao terminar cada etapa
- Manter estética: serifado elegante, streetwear minimalista, muito whitespace

## Estado atual (2026-04-21)

- Branch ativa: `bloco-3.5-visual` (ahead do `main`), commit mais recente `1e5f126`
- Landing, catálogo, PDP e checkout funcionais com mock products
- Firebase instalado em `src/lib/firebase.ts` mas **ainda não configurado** (sem `.env` com creds)
- Sem pastas `src/app/admin/` nem `src/middleware.ts` ainda

## Kickoff do Bloco 4 — Admin

Ordem sugerida para a próxima sessão:

1. **Firebase setup real**: criar projeto Firebase, popular `.env.local` com creds (`NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_ADMIN_*` server-side), testar conexão
2. **Firestore schema**: migrar produtos mock (`src/lib/mock-products.ts`) pro Firestore, atualizar `src/lib/products.ts` e `src/lib/drops.ts` pra ler do Firestore em vez do mock
3. **Auth**: Firebase Auth com email/senha, custom claim `admin: true` via Admin SDK em script one-off, criar contas pra Giovana + Tecnosup
4. **Middleware**: `src/middleware.ts` protegendo `/admin/*` — verifica session cookie Firebase, redireciona pra `/admin/login` se não autenticado
5. **Rotas admin**: `/admin/login`, `/admin/` (dashboard com stats), `/admin/produtos` (lista + CRUD), `/admin/produtos/novo`, `/admin/produtos/[id]/editar`, `/admin/drops` (CRUD de drops)
6. **Storage upload**: componente `ImageUploader` usando Firebase Storage, preview, múltiplas imagens por produto, reorder
7. **Security Rules**: `firestore.rules` + `storage.rules` — leitura pública de produtos/drops ativos, escrita só com `request.auth.token.admin == true`
8. **Audit log**: coleção `audit_logs` gravando toda mutação de produto/drop (quem, quando, o quê)

### Arquivos-chave pra consultar antes de começar

- `src/lib/types.ts` — interface `Product`, `Drop` (schema que vai pro Firestore)
- `src/lib/products.ts` / `src/lib/drops.ts` — trocar leitura de mock por Firestore
- `src/lib/mock-products.ts` — seed pra popular o Firestore
- `src/lib/firebase.ts` — client SDK já existe, falta Admin SDK (`firebase-admin`) pra server-side

### Decisões já tomadas

- Manter mock como fallback durante migração (feature flag `USE_FIRESTORE=true`)
- Admin não precisa de 2FA (decidido no kickoff)
- Logs de auditoria em coleção separada, não em subcoleção do produto
