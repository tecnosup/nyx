export const SITE_CONFIG = {
  name: "NYX.",
  tagline: "Streetwear em drops exclusivos",
  description:
    "NYX é uma curadoria de peças raras, edições limitadas e drops selecionados. Cada peça é única, numerada e chega até você direto do nosso radar.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5512981646555",
  instagram: "https://instagram.com/nyx",
} as const;

export const NAVIGATION = [
  { label: "Catálogo", href: "/produtos" },
  { label: "Drops", href: "/drops" },
] as const;

export const PRODUCT_CATEGORIES = [
  { slug: "camisetas", label: "Camisetas" },
  { slug: "moletons", label: "Moletons" },
  { slug: "calcas", label: "Calças" },
  { slug: "jaquetas", label: "Jaquetas" },
  { slug: "acessorios", label: "Acessórios" },
] as const;