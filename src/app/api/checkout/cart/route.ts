import { NextResponse, type NextRequest } from "next/server";
import { cartCheckoutSchema } from "@/lib/checkout";
import { checkRate, getClientIp } from "@/lib/rate-limit";
import { adminCreateOrder } from "@/lib/admin-orders";
import { isAdminConfigured } from "@/lib/firebase-admin";

export const runtime = "nodejs";

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

  const parsed = cartCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { items, shipping, paymentMethod, notes } = parsed.data;

  let orderId = `local-${Date.now()}`;

  if (isAdminConfigured) {
    try {
      orderId = await adminCreateOrder({
        type: "cart",
        customerName: shipping.name,
        customerPhone: shipping.phone,
        shipping,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          productSlug: i.productSlug,
          productName: i.productName,
          size: i.size,
          color: i.color || undefined,
          pricePix: i.pricePix,
          priceCard: i.priceCard,
        })),
        notes: notes || undefined,
      });
    } catch (err) {
      console.error("[checkout/cart] Firestore error:", err);
    }
  }

  return NextResponse.json({ ok: true, orderId });
}
