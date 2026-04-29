import { NextResponse, type NextRequest } from "next/server";
import { adminGetCouponByCode, adminIncrementCouponUsage } from "@/lib/admin-coupons";
import { checkRate, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRate(`coupon:${ip}`, 20, 60_000);

  if (!rate.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { code, apply } = body as { code?: string; apply?: boolean };

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "code_required" }, { status: 400 });
  }

  const coupon = await adminGetCouponByCode(code);

  if (!coupon) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!coupon.active) {
    return NextResponse.json({ error: "inactive" }, { status: 422 });
  }

  if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
    return NextResponse.json({ error: "expired" }, { status: 422 });
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "limit_reached" }, { status: 422 });
  }

  if (apply) {
    await adminIncrementCouponUsage(coupon.id);
  }

  return NextResponse.json({
    ok: true,
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
  });
}
