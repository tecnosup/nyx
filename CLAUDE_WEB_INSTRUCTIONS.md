# NYX — Instruções para Claude Web

> Cole este documento no início de uma conversa no Claude Web para recuperar todo o contexto do projeto.

---

## O que é este projeto

NYX é um e-commerce de streetwear da cliente **Giovanna**, que trabalha com **drops exclusivos** — compra pequenas quantidades de vários fornecedores e revende como edições limitadas. Desenvolvido pela agência **Tecnosup** (Abraão).

- **Repositório:** `github.com/tecnosup/nyx`
- **Deploy:** Vercel (auto-deploy via push no `main`)
- **Cliente final:** Giovanna (dona da NYX)
- **Instagram:** `@nyxxwear_`
- **WhatsApp da Giovanna:** 5512981646555

---

## Stack técnica

- **Next.js 15.5.15** (App Router) + TypeScript
- **React 19**
- **TailwindCSS 3.4** (tema NYX com tokens `nyx-*`)
- **Firebase Auth** — autenticação admin via email/senha + session cookie
- **Firebase Firestore** — banco (produtos, drops, categorias, auditLogs, settings)
- **Firebase Admin SDK** — server-side
- **Cloudinary** — upload e storage de imagens (substitui Firebase Storage)
- **Framer Motion** — animações
- **Lucide React** — ícones
- **React Hook Form + Zod** — formulários e validação
- **Vercel** — deploy

---

## Branding

**Paleta dark olive:**
- `#100f0a` — bg (fundo)
- `#ede8d8` — ink (texto principal)
- `#8c8578` — muted
- `#5c5a4f` — soft
- `#2a2820` — line (bordas)
- `#6e6a5e` — stone
- `#1b1a13` — cream

**Tipografia:**
- Títulos/editorial: **Cormorant Garamond** (peso 300–700)
- Corpo/labels/UI: **Inter**

**Tom de voz:** streetwear exclusivo, drop culture, edição limitada. Impacto vem do *spotlight sobre o produto*, não de movimento ou densidade.

**Direção visual (FLOWBIT/REPRESENT):**
- Produto-herói centralizado em vinheta radial, nav ultra-minimal
- Grid catálogo: 4 colunas, ghost bg, só nome + preço
- PDP: galeria em vinheta, specs em Cormorant, CTA rounded-none ("botão industrial")
- Muito whitespace — o foco é o produto, não o ruído visual
- Motion: mouse-parallax suave no hero (~18px), floaty CSS, marquee infinito. Sem tilt 3D nos cards

---

## Arquitetura de rotas

```
src/app/
├── (public)/
│   ├── page.tsx                 Hero + Manifesto + Drops + Catálogo
│   ├── produtos/
│   │   ├── page.tsx             Catálogo completo com filtro por categoria
│   │   ├── [slug]/page.tsx      PDP (galeria, tamanhos, CTA WhatsApp)
│   │   └── categoria/[cat]/     Filtro de categoria
│   ├── drops/
│   │   ├── page.tsx             Lista de drops
│   │   └── [slug]/page.tsx      Detalhe do drop
│   ├── carrinho/page.tsx        Checkout multi-item via WhatsApp
│   ├── checkout/page.tsx        Checkout item único
│   ├── privacidade/page.tsx
│   ├── termos/page.tsx
│   └── trocas/page.tsx
│
├── admin/
│   ├── login/page.tsx
│   └── (protected)/
│       ├── page.tsx             Dashboard (KPIs)
│       ├── produtos/            CRUD completo
│       ├── drops/               CRUD completo
│       ├── categorias/          CRUD completo
│       ├── auditoria/page.tsx   Últimas 200 ações
│       └── configuracoes/       Produto em destaque no hero
│
└── api/
    ├── admin/session/           Login/logout (session cookie)
    ├── admin/set-claim/         Define admin claim no Firebase
    ├── admin/upload/            Upload Cloudinary (server-side)
    └── checkout/                Validação + rate-limit
```

---

## Schema Firestore

### `products/{id}`
```ts
{
  slug: string;
  name: string;
  description: string;
  category: string;        // slug da categoria
  pricePix: number;
  priceCard: number;
  images: string[];        // URLs Cloudinary
  sizes: { size: ProductSize; quantity: number }[];
  colors: string[];        // até 5 cores
  dropId: string | null;
  isLimited: boolean;
  status: "draft" | "published";
  createdAt: number;       // ms
  updatedAt: number;
}
```

### `drops/{id}`
```ts
{
  slug: string;
  name: string;
  description: string;
  releaseDate: number;     // ms
  status: "upcoming" | "active" | "archived";
  heroImage: string;       // URL Cloudinary
  createdAt: number;
  updatedAt: number;
}
```

### `categories/{id}`
```ts
{ slug: string; label: string; order: number; }
```
> Fallback automático para categorias hardcoded se Firestore estiver vazio.

### `settings/home`
```ts
{ featuredProductId: string | null; }
```

---

## Convenções do código

- Server Actions retornam `{ ok: true } | { ok: false; error: string }`. `redirect()` no success-path.
- Cookie admin: `nyx_admin_session`, HttpOnly, SameSite=Lax, 7 dias
- Cart: localStorage `nyx_cart`, CartItem = `{ productId, productSlug, productName, productImage, size, color?, price }`
- Upload: Cloudinary via `/api/admin/upload` (nunca expõe credenciais no client)
- Dev server costuma subir em `localhost:3002` (3000/3001 ocupadas)
- Checkout via WhatsApp (`wa.me`) — sem gateway de pagamento ainda

---

## Estado atual (2026-04-27)

**Projeto em produção no Vercel. Todos os blocos concluídos.**

### Funcionalidades implementadas

**Site público:** hero configurável, catálogo com filtro, PDP (galeria, tamanhos, cores, CTA), carrinho (drawer lateral + localStorage), checkout único e multi-item via WhatsApp, drops com countdown, marquee infinito, scroll reveal, SEO completo (metadata dinâmica, OG, JSON-LD), sitemap + robots, CookieBanner LGPD, páginas legais.

**Admin:** auth Firebase + session cookie + middleware + AdminAuthGuard, dashboard com 4 KPIs, CRUD produtos/drops/categorias, upload múltiplo Cloudinary, auditoria (timestamp em horário Brasília), configurações (produto em destaque no hero), nav responsiva.

### Commits recentes
- `3c7fe06` chore: trigger vercel redeploy
- `1178be7` fix(checkout): adicionar link do produto na mensagem do carrinho
- `af88a5b` fix: corrigir bugs de categorias, cores esgotadas e disclaimer legal
- `05a80ad` fix(categorias): usar admin SDK para ler categorias em páginas públicas
- `85107cb` fix: categorias dinâmicas do Firestore + estoque por cor

### O que falta (opcional / futuro)
- Publicar `storage.rules` no Firebase Console
- Seed das categorias padrão no Firestore via `/admin/categorias`
- Produtos criados antes da última sessão sem campo `pricePix`/`priceCard` — editar via admin ou script seed
- WhatsApp Cloud API (Fase 2 — bot automatizado)
- Google Analytics (componente `Analytics.tsx` existe, falta `GA_ID`)
- Domínio customizado no Vercel

---

## Regras de trabalho

1. **Mostrar o plano antes de mudanças grandes** — não aplicar sem revisão
2. **Editar arquivos existentes** — não recriar do zero
3. **Não reinstalar dependências sem perguntar**
4. **Avisar inconsistências** entre este documento e o código real
5. **Sem comentários óbvios** no código — só quando o "porquê" for não-óbvio
6. **NUNCA modificar este projeto para outro cliente** — novo cliente = nova pasta, nunca alterar `nyx/`

---

## Segurança

- Middleware Next.js: `/admin/*` verifica session cookie antes de renderizar
- `AdminAuthGuard`: client-side guard como segunda camada
- Custom claim `admin: true` no Firebase Auth
- Rate limiting em checkout: 8 req/min por IP (in-memory)
- Zod validation em todas as Server Actions e API routes
- Headers de segurança: CSP, HSTS, X-Frame-Options, X-Content-Type-Options (`next.config.ts`)

---

## Variáveis de ambiente

```bash
# Público
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=NYX
NEXT_PUBLIC_WHATSAPP_NUMBER=5512981646555

# Servidor
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
