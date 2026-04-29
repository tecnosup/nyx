import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { checkRate, getClientIp } from "@/lib/rate-limit";
import { adminCreateOrder } from "@/lib/admin-orders";
import { isAdminConfigured } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const backorderSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  pricePix: z.number().nonnegative().max(100_000),
  priceCard: z.number().nonnegative().max(100_000),
  size: z.string().min(1),
  color: z.string().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Nome obrigatório").max(120),
  phone: z.string().trim().refine((v) => {
    const d = v.replace(/\D/g, "");
    return d.length === 10 || d.length === 11;
  }, "Telefone inválido"),
  notes: z.string().max(300).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRate(`checkout:${ip}`, 8, 60_000);

  if (!rate.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = backorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { productId, productSlug, productName, pricePix, priceCard, size, color, name, phone, notes } = parsed.data;

  let orderId = `local-${Date.now()}`;

  if (isAdminConfigured) {
    try {
      orderId = await adminCreateOrder({
        type: "backorder",
        customerName: name,
        customerPhone: phone,
        shipping: { name, phone, cep: "", street: "", number: "", neighborhood: "", city: "", state: "" },
        paymentMethod: "combinar",
        items: [{ productId, productSlug, productName, size, color: color || undefined, pricePix, priceCard }],
        notes: notes || undefined,
      });
    } catch (err) {
      console.error("[backorder] Firestore error:", err);
    }
  }

  return NextResponse.json({ ok: true, orderId });
}
