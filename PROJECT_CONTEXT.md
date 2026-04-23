# Contexto do Projeto NYX

> Documento de referência para o Claude. Após `/clear`, basta pedir "olhe o PROJECT_CONTEXT.md" para recuperar todo o contexto.

## Sobre o projeto

NYX é um e-commerce de streetwear da cliente **Giovanna**, que trabalha com **drops exclusivos** (compra pequenas quantidades de peças de vários fornecedores e revende como edições limitadas). Desenvolvido pela agência **Tecnosup** (Abraão).

- **Localização:** `C:\Users\cardo\nyx`
- **Repositório:** `github.com/tecnosup/nyx`
- **Deploy:** Vercel (auto-deploy via push no `main`)
- **URL Vercel:** `nyxstore-e3s3smezs-tecnosups-projects.vercel.app`
- **Cliente final:** Giovanna (dona da NYX)
- **Dev/Agência:** Tecnosup (Abraão)

---

## Branding

- **Paleta dark olive (atual):**
  - `#100f0a` — bg (fundo)
  - `#ede8d8` — ink (texto principal)
  - `#8c8578` — muted
  - `#5c5a4f` — soft
  - `#2a2820` — line (bordas)
  - `#6e6a5e` — stone
  - `#1b1a13` — cream
- **Tipografia:**
  - Títulos: **Cormorant Garamond** (serifada elegante, peso 300–700)
  - Corpo/labels: **Inter** (sans-serif)
- **Tom de voz:** streetwear exclusivo, edição limitada, drop culture
- **Instagram:** `@nyxxwear_`

---

## Stack técnica

- **Next.js 15.5.15** (App Router) + TypeScript
- **React 19**
- **TailwindCSS 3.4** (tema NYX configurado com tokens `nyx-*`)
- **Firebase Auth** — autenticação admin via email/senha + session cookie
- **Firebase Firestore** — banco de dados (produtos, drops, categorias, auditLogs, settings)
- **Firebase Admin SDK** — server-side (verificação de session, custom claims, CRUD admin)
- **Cloudinary** — upload e storage de imagens (substituiu Firebase Storage)
- **Framer Motion** — animações (hero parallax, scroll reveal, marquee)
- **Lucide React** — ícones
- **React Hook Form + Zod** — formulários e validação
- **Vercel** — deploy e CDN

---

## Arquitetura de rotas

```
src/app/
├── (public)/                    ← Site público (com Navbar + Footer)
│   ├── page.tsx                 Hero + Manifesto + Drops + Catálogo
│   ├── produtos/
│   │   ├── page.tsx             Catálogo completo com filtro por categoria
│   │   ├── [slug]/page.tsx      PDP (galeria, tamanhos, CTA WhatsApp)
│   │   └── categoria/[cat]/     Filtro de categoria
│   ├── drops/
│   │   ├── page.tsx             Lista de drops
│   │   └── [slug]/page.tsx      Detalhe do drop
│   ├── carrinho/page.tsx        Carrinho + formulário checkout multi-item
│   ├── checkout/page.tsx        Checkout item único
│   ├── privacidade/page.tsx     Política de privacidade (LGPD)
│   ├── termos/page.tsx          Termos de uso
│   └── trocas/page.tsx          Política de trocas e devoluções
│
├── admin/
│   ├── login/page.tsx           Login Firebase (email + senha)
│   └── (protected)/             ← Protegido por middleware + AdminAuthGuard
│       ├── page.tsx             Dashboard (stats: produtos, estoque, drops)
│       ├── produtos/            CRUD completo (lista, novo, editar)
│       ├── drops/               CRUD completo (lista, novo, editar)
│       ├── categorias/          CRUD completo (lista, nova, editar)
│       ├── auditoria/page.tsx   Log de todas as mutações (últimas 200)
│       └── configuracoes/       Produto em destaque no hero
│
├── api/
│   ├── admin/session/           Login/logout (cria/apaga session cookie)
│   ├── admin/set-claim/         Script one-off: define admin claim no Firebase
│   ├── admin/upload/            Upload de imagens via Cloudinary
│   └── checkout/                Validação + rate-limiting do checkout
│
├── icon.tsx                     Favicon gerado dinamicamente
├── robots.ts                    robots.txt
└── sitemap.ts                   Sitemap dinâmico
```

---

## Schema de dados (Firestore)

### `products/{id}`
```ts
{
  slug: string;
  name: string;
  description: string;
  category: string;       // slug da categoria
  pricePix: number;       // preço no Pix
  priceCard: number;      // preço no cartão
  images: string[];       // URLs Cloudinary
  sizes: { size: ProductSize; quantity: number }[];
  colors: string[];       // até 5 cores
  dropId: string | null;
  isLimited: boolean;
  status: "draft" | "published";
  createdAt: number;      // ms
  updatedAt: number;      // ms
}
```

### `drops/{id}`
```ts
{
  slug: string;
  name: string;
  description: string;
  releaseDate: number;    // ms
  status: "upcoming" | "active" | "archived";
  heroImage: string;      // URL Cloudinary
  createdAt: number;
  updatedAt: number;
}
```

### `categories/{id}`
```ts
{
  slug: string;
  label: string;
  order: number;
}
```
> Fallback automático para categorias hardcoded se coleção estiver vazia.

### `auditLogs/{id}`
```ts
{
  actorUid: string;
  actorEmail: string | null;
  action: string;         // "product.create" | "product.update" | ...
  entity: "product" | "drop";
  entityId: string;
  summary?: string;
  createdAt: FieldValue;  // Timestamp Firestore (exibido em horário Brasília)
}
```

### `settings/home`
```ts
{
  featuredProductId: string | null;  // produto exibido no hero
}
```

---

## Funcionalidades implementadas

### Site público
- **Hero** — produto em destaque configurável, parallax com mouse, animação floaty
- **Catálogo** — grid responsivo, badge "Últimas unidades", hover overlay, filtro por categoria
- **PDP** — galeria com troca de imagem, seletor de tamanho/cor, botão comprar + adicionar ao carrinho, produtos relacionados
- **Carrinho** — drawer lateral, persistência localStorage, badge de contagem no nav
- **Checkout único** — formulário Zod, autofill CEP (ViaCEP), forma de pagamento, link WhatsApp pré-formatado com preço correto (Pix ou Cartão)
- **Checkout carrinho** — formulário multi-item, subtotal Pix e Cartão no resumo, WhatsApp com todos os itens
- **Drops** — listagem e detalhe, countdown para drop futuro
- **Marquee** — carrossel infinito com produtos publicados
- **Scroll reveal** — animações on-scroll nos cards
- **SEO** — metadata dinâmica por produto/drop, Open Graph, JSON-LD (Product, Organization, WebSite, Event)
- **Sitemap + robots** — gerados dinamicamente
- **CookieBanner** — LGPD
- **Páginas legais** — Privacidade, Termos, Trocas

### Admin
- **Auth** — login Firebase, session cookie 5 dias, middleware Next.js protegendo `/admin/*`
- **Dashboard** — 4 KPIs: produtos publicados, unidades em estoque, esgotados, drops futuros
- **Produtos** — listar (tabela com Pix/Cartão), criar, editar, deletar, toggle publicado/rascunho
- **Imagens** — upload múltiplo via Cloudinary (drag & drop implícito), preview, reorder
- **Drops** — CRUD completo, upload de hero image
- **Categorias** — CRUD completo
- **Configurações** — seleção do produto em destaque no hero
- **Auditoria** — log das últimas 200 ações, timestamp em horário Brasília
- **Nav responsivo** — desktop horizontal, mobile hamburger com drawer lateral

---

## Segurança

- Middleware Next.js: `/admin/*` verifica session cookie Firebase antes de renderizar
- `AdminAuthGuard`: client-side guard com `onAuthStateChanged` como segunda camada
- Custom claim `admin: true` no Firebase Auth — definido via `/api/admin/set-claim`
- Rate limiting em checkout: 8 req/min por IP (in-memory)
- Zod validation em todas as Server Actions e API routes
- Headers de segurança: CSP, HSTS, X-Frame-Options, X-Content-Type-Options (via `next.config.ts`)
- Cloudinary: upload via server-side route, nunca expõe credenciais no client

---

## Variáveis de ambiente necessárias

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

---

## Estado atual (2026-04-23)

Todos os blocos de desenvolvimento concluídos. Projeto **em produção no Vercel**.

### Commits recentes
- `b2083aa` feat: preço Pix e Cartão em todos os produtos
- `1072ada` fix: hero desktop — imagem menor e padding inferior
- `1a5b9c4` feat: produto em destaque configurável pelo admin
- `8859c0f` fix: admin mobile nav responsiva e horário de auditoria em Brasília
- `35f87c2` style: paleta dark olive — fundo #100f0a, texto #ede8d8
- `772ac32` feat: carrinho, categorias admin, bugs e design

### O que falta (opcional / Bloco 5+)
- Publicar `storage.rules` no Firebase Console (atualmente só `firestore.rules`)
- Seed das categorias padrão no Firestore via `/admin/categorias`
- Migrar produtos mock para Firestore via `/admin/produtos` ou script seed
- Produtos existentes no Firestore criados antes desta sessão não têm campo `pricePix`/`priceCard` — precisam ser editados pelo admin ou migrados via script
- WhatsApp Cloud API (Fase 2 do checkout — bot automatizado)
- Google Analytics (componente `Analytics.tsx` existe, falta `GA_ID`)
- Domínio customizado no Vercel

---

## Regras de trabalho

- Sempre mostrar o que vai fazer antes de mudanças grandes
- Preferir editar arquivos existentes vs recriar do zero
- Não reinstalar dependências sem perguntar
- Avisar inconsistências entre doc e código real
- Sem comentários óbvios no código — só quando o "porquê" for não-óbvio
- Manter estética: dark olive, serifado elegante, streetwear exclusivo
