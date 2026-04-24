export const SITE_CONFIG = {
  name: "NYX.",
  tagline: "Streetwear em drops exclusivos",
  description:
    "Nasceu de um reencontro com a moda. Selecionamos a dedo o que há de mais atual para elevar sua autoestima.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5512981646555",
  instagram: "https://www.instagram.com/nyxxwear_/",
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