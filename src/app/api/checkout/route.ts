import { NextResponse, type NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/checkout";
import { checkRate, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRate(`checkout:${ip}`, 8, 60_000);

  if (!rate.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Fase 1: validar shape, registrar um id local e responder OK.
  // A montagem do link wa.me acontece no client.
  //
  // Fase 2: neste ponto, criar o documento `orders/{id}` via admin SDK
  // com status "pending", disparar mensagem pela WhatsApp Cloud API,
  // retornar o id real gerado pelo Firestore.
  const orderId = `wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return NextResponse.json({ ok: true, orderId });
}
