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

- [x] **Bloco 1** — Fundação: landing base, Hero, Manifesto, Navbar, Footer, design tokens ← *atual*
- [ ] **Bloco 2** — Catálogo público: schema de produtos no Firestore, grid responsivo (até 25 produtos), página de detalhe com galeria, sistema de drops e edição limitada, badges "últimas peças"/"esgotado", categorias (camisetas, moletons, calças, jaquetas, acessórios)
- [ ] **Bloco 3** — Checkout via `wa.me`: formulário validado, geração de mensagem formatada com produto/tamanho/endereço/pagamento preferido
- [ ] **Bloco 4** — Admin: Firebase Auth, dashboard, CRUD de produtos com upload pro Storage, gestão de drops, estoque, logs de auditoria
- [ ] **Bloco 5** — Polish: SEO dinâmico, Open Graph por produto, contador regressivo do próximo drop, Google Analytics, deploy Firebase Hosting, Cloud API

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

## Problema aberto (Bloco 1)

Ao rodar `npm run dev`, `/` retorna **404 "This page could not be found"**.

Hipóteses:
1. `src/app/page.tsx` original (do `create-next-app`) não foi deletado — conflita com `src/app/(public)/page.tsx`
2. Pasta `(public)` foi criada sem parênteses (como `public/`) — vira `/public` em vez de `/`
