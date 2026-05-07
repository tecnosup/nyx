export type ProductCategory = string;

export type ProductSize = "PP" | "P" | "M" | "G" | "GG" | "UNICO";

export type DropStatus = "upcoming" | "active" | "archived";

export type ProductStatus = "draft" | "published";

export interface SizeStock {
  size: ProductSize;
  quantity: number;
}

export interface ColorStock {
  name: string;
  soldOut: boolean;
  sizes: SizeStock[];
}

function _normSizes(raw: unknown): SizeStock[] {
  if (!Array.isArray(raw)) return [];
  const VALID: ProductSize[] = ["PP", "P", "M", "G", "GG", "UNICO"];
  return (raw as unknown[])
    .filter((s) => s && typeof s === "object" && VALID.includes((s as Record<string, unknown>).size as ProductSize))
    .map((s) => ({
      size: (s as Record<string, unknown>).size as ProductSize,
      quantity: Math.max(0, Math.round(Number((s as Record<string, unknown>).quantity) || 0)),
    }));
}

export function normalizeColors(raw: unknown): ColorStock[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c) => {
      if (typeof c === "string") return { name: c, soldOut: false, sizes: [] };
      const obj = c as Record<string, unknown>;
      return {
        name: String(obj?.name ?? ""),
        soldOut: Boolean(obj?.soldOut),
        sizes: _normSizes(obj?.sizes),
      };
    })
    .filter((c) => c.name.trim().length > 0);
}

export interface Product {
  id: string;
  slug: string;
  deleted?: boolean;
  name: string;
  description: string;
  category: ProductCategory;
  pricePix: number;
  priceCard: number;
  compareAtPricePix?: number;  // original price before discount (strikethrough)
  compareAtPriceCard?: number;
  images: string[];
  sizes: SizeStock[];
  dropId: string | null;
  colors: ColorStock[];
  isLimited: boolean;
  status: ProductStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Drop {
  id: string;
  slug: string;
  name: string;
  description: string;
  releaseDate: number;
  status: DropStatus;
  heroImage?: string;
  createdAt: number;
  updatedAt: number;
}

export type StockLevel = "in-stock" | "low" | "sold-out";

export function totalStock(product: Pick<Product, "sizes">): number {
  return (product.sizes ?? []).reduce((sum, s) => sum + s.quantity, 0);
}

export function stockLevel(product: Pick<Product, "sizes">): StockLevel {
  const total = totalStock(product);
  if (total === 0) return "sold-out";
  if (total <= 3) return "low";
  return "in-stock";
}

export function availableSizes(product: Pick<Product, "sizes">): SizeStock[] {
  return (product.sizes ?? []).filter((s) => s.quantity > 0);
}

export const CATEGORY_LABELS: Record<string, string> = {
  camisetas: "Camisetas",
  moletons: "Moletons",
  calcas: "Calças",
  jaquetas: "Jaquetas",
  acessorios: "Acessórios",
};

export const SIZE_ORDER: ProductSize[] = ["PP", "P", "M", "G", "GG", "UNICO"];

export const SIZE_LABELS: Record<ProductSize, string> = {
  PP: "PP",
  P: "P",
  M: "M",
  G: "G",
  GG: "GG",
  UNICO: "Único (36 ao 42)",
};

export type PaymentMethod = "pix" | "cartao" | "transferencia" | "combinar";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  cartao: "Cartão de crédito",
  transferencia: "Transferência bancária",
  combinar: "Combinar no WhatsApp",
};

export interface ShippingAddress {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface OrderItem {
  productId: string;
  productSlug: string;
  productName: string;
  size: ProductSize;
  pricePix: number;
  priceCard: number;
}

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface Order {
  id: string;
  item: OrderItem;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  whatsappMessage: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}
