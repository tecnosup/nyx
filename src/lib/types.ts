export type ProductCategory = string;

export type ProductSize = "PP" | "P" | "M" | "G" | "GG" | "UNICO";

export type DropStatus = "upcoming" | "active" | "archived";

export type ProductStatus = "draft" | "published";

export interface SizeStock {
  size: ProductSize;
  quantity: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  images: string[];
  sizes: SizeStock[];
  dropId: string | null;
  colors: string[];
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
  return product.sizes.reduce((sum, s) => sum + s.quantity, 0);
}

export function stockLevel(product: Pick<Product, "sizes">): StockLevel {
  const total = totalStock(product);
  if (total === 0) return "sold-out";
  if (total <= 3) return "low";
  return "in-stock";
}

export function availableSizes(product: Pick<Product, "sizes">): SizeStock[] {
  return product.sizes.filter((s) => s.quantity > 0);
}

export const CATEGORY_LABELS: Record<string, string> = {
  camisetas: "Camisetas",
  moletons: "Moletons",
  calcas: "Calças",
  jaquetas: "Jaquetas",
  acessorios: "Acessórios",
};

export const SIZE_ORDER: ProductSize[] = ["PP", "P", "M", "G", "GG", "UNICO"];

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
  price: number;
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
