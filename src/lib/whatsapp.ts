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
import type { AppliedCoupon } from "@/components/checkout/CouponInput";

function applyDiscount(total: number, coupon?: AppliedCoupon): number {
  if (!coupon) return total;
  if (coupon.type === "percent") return Math.max(0, total - Math.round(total * coupon.value) / 100);
  return Math.max(0, total - coupon.value);
}

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

function effectivePrice(pricePix: number, priceCard: number, method: PaymentMethod): number {
  return method === "cartao" ? priceCard : pricePix;
}

export interface OrderMessagePayload {
  product: Pick<Product, "slug" | "name" | "pricePix" | "priceCard">;
  size: ProductSize;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  coupon?: AppliedCoupon;
}

export function buildOrderMessage(payload: OrderMessagePayload): string {
  const { product, size, shipping, paymentMethod, notes, coupon } = payload;
  const basePrice = effectivePrice(product.pricePix, product.priceCard, paymentMethod);
  const finalPrice = applyDiscount(basePrice, coupon);
  const complement = shipping.complement?.trim();
  const lines: string[] = [
    "Olá, Giovanna! Fiz meu pedido na NYX.",
    "",
    "*Peça*",
    product.name,
    `Tamanho: ${size}`,
    `Pix: ${formatPrice(product.pricePix)} · Cartão: ${formatPrice(product.priceCard)}`,
    `Forma escolhida: ${PAYMENT_LABELS[paymentMethod]} → ${formatPrice(basePrice)}`,
  ];

  if (coupon) {
    const discountLabel =
      coupon.type === "percent" ? `${coupon.value}%` : formatPrice(coupon.value);
    lines.push(`*Cupom: ${coupon.code} (${discountLabel} off) → Total: ${formatPrice(finalPrice)}*`);
  }

  lines.push(
    "",
    "*Entrega*",
    shipping.name,
    `${shipping.street}, ${shipping.number}${complement ? ` — ${complement}` : ""}`,
    `${shipping.neighborhood}, ${shipping.city} — ${shipping.state}`,
    `CEP: ${formatCep(shipping.cep)}`,
    `Tel: ${formatPhone(shipping.phone)}`
  );

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
  coupon?: AppliedCoupon;
}

export function buildCartOrderMessage(payload: CartOrderMessagePayload): string {
  const { items, shipping, paymentMethod, notes, coupon } = payload;
  const subtotal = items.reduce(
    (sum, i) => sum + effectivePrice(i.pricePix, i.priceCard, paymentMethod),
    0
  );
  const finalTotal = applyDiscount(subtotal, coupon);
  const complement = shipping.complement?.trim();

  const lines: string[] = [
    "Olá, Giovanna! Fiz meu pedido na NYX.",
    "",
    `*Peças (${items.length} ${items.length === 1 ? "item" : "itens"})*`,
  ];

  items.forEach((item) => {
    const colorPart = item.color ? ` · ${item.color}` : "";
    const price = effectivePrice(item.pricePix, item.priceCard, paymentMethod);
    lines.push(`• ${item.productName} — Tam. ${item.size}${colorPart} — ${formatPrice(price)}`);
    lines.push(`  ${SITE_CONFIG.url}/produtos/${item.productSlug}`);
  });

  if (coupon) {
    const discountLabel =
      coupon.type === "percent" ? `${coupon.value}%` : formatPrice(coupon.value);
    lines.push(
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      `*Cupom: ${coupon.code} (${discountLabel} off)*`,
      `*Total final (${PAYMENT_LABELS[paymentMethod]}): ${formatPrice(finalTotal)}*`
    );
  } else {
    lines.push(
      "",
      `*Total (${PAYMENT_LABELS[paymentMethod]}): ${formatPrice(subtotal)}*`
    );
  }

  lines.push(
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

export interface BackorderMessagePayload {
  product: Pick<Product, "slug" | "name" | "pricePix">;
  size: ProductSize;
  color?: string;
  name: string;
  phone: string;
  notes?: string;
}

export function buildBackorderMessage(payload: BackorderMessagePayload): string {
  const { product, size, color, name, phone, notes } = payload;
  const lines: string[] = [
    "Olá, Giovanna! Vi que um produto está esgotado na NYX e gostaria de encomendar.",
    "",
    "*Peça*",
    product.name,
    `Tamanho desejado: ${size}`,
    ...(color ? [`Cor desejada: ${color}`] : []),
    `Preço Pix: ${formatPrice(product.pricePix)}`,
    `Link: ${SITE_CONFIG.url}/produtos/${product.slug}`,
    "",
    "*Meus dados*",
    `Nome: ${name}`,
    `WhatsApp: ${phone}`,
  ];

  if (notes && notes.trim()) {
    lines.push("", `*Observações:* ${notes.trim()}`);
  }

  lines.push("", "Pode me avisar quando estiver disponível ou combinar uma encomenda?");

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}
