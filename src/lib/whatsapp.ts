import { SITE_CONFIG } from "./constants";
import { formatPrice } from "./utils";
import {
  PAYMENT_LABELS,
  type PaymentMethod,
  type Product,
  type ProductSize,
  type ShippingAddress,
} from "./types";
import type { CartItem } from "./cart";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCep(cep: string): string {
  const d = digits(cep);
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep;
}

export function formatPhone(phone: string): string {
  const d = digits(phone);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

export interface OrderMessagePayload {
  product: Pick<Product, "slug" | "name" | "price">;
  size: ProductSize;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export function buildOrderMessage(payload: OrderMessagePayload): string {
  const { product, size, shipping, paymentMethod, notes } = payload;
  const complement = shipping.complement?.trim();
  const lines: string[] = [
    "Olá, Giovana! Fiz meu pedido na NYX.",
    "",
    "*Peça*",
    product.name,
    `Tamanho: ${size}`,
    `Valor: ${formatPrice(product.price)}`,
    "",
    "*Entrega*",
    shipping.name,
    `${shipping.street}, ${shipping.number}${complement ? ` — ${complement}` : ""}`,
    `${shipping.neighborhood}, ${shipping.city} — ${shipping.state}`,
    `CEP: ${formatCep(shipping.cep)}`,
    `Tel: ${formatPhone(shipping.phone)}`,
    "",
    `*Pagamento preferido:* ${PAYMENT_LABELS[paymentMethod]}`,
  ];

  if (notes && notes.trim()) {
    lines.push("", `*Observações:* ${notes.trim()}`);
  }

  lines.push(
    "",
    `Link: ${SITE_CONFIG.url}/produtos/${product.slug}`,
    "",
    "Pode confirmar frete e prazo?"
  );

  return lines.join("\n");
}

export interface CartOrderMessagePayload {
  items: CartItem[];
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export function buildCartOrderMessage(payload: CartOrderMessagePayload): string {
  const { items, shipping, paymentMethod, notes } = payload;
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const complement = shipping.complement?.trim();

  const lines: string[] = [
    "Olá, Giovana! Fiz meu pedido na NYX.",
    "",
    `*Peças (${items.length} ${items.length === 1 ? "item" : "itens"})*`,
  ];

  items.forEach((item) => {
    const colorPart = item.color ? ` · ${item.color}` : "";
    lines.push(`• ${item.productName} — Tam. ${item.size}${colorPart} — ${formatPrice(item.price)}`);
  });

  lines.push(
    "",
    `*Total: ${formatPrice(subtotal)}*`,
    "(frete a combinar)",
    "",
    "*Entrega*",
    shipping.name,
    `${shipping.street}, ${shipping.number}${complement ? ` — ${complement}` : ""}`,
    `${shipping.neighborhood}, ${shipping.city} — ${shipping.state}`,
    `CEP: ${formatCep(shipping.cep)}`,
    `Tel: ${formatPhone(shipping.phone)}`,
    "",
    `*Pagamento preferido:* ${PAYMENT_LABELS[paymentMethod]}`
  );

  if (notes && notes.trim()) {
    lines.push("", `*Observações:* ${notes.trim()}`);
  }

  lines.push("", "Pode confirmar frete e prazo?");

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}
