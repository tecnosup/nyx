import { NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase-admin";
import { MOCK_DROPS, MOCK_PRODUCTS } from "@/lib/mock-products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized(reason: string) {
  return NextResponse.json({ error: reason }, { status: 401 });
}

export async function POST(req: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) return unauthorized("SEED_SECRET não configurado no servidor.");

  const header = req.headers.get("x-seed-secret");
  if (header !== secret) return unauthorized("Secret inválido.");

  if (!isAdminConfigured) {
    return NextResponse.json(
      { error: "Firebase Admin não configurado." },
      { status: 500 }
    );
  }

  const db = adminDb();
  const batch = db.batch();

  for (const drop of MOCK_DROPS) {
    const { id, ...data } = drop;
    batch.set(db.collection("drops").doc(id), data, { merge: true });
  }
  for (const product of MOCK_PRODUCTS) {
    const { id, ...data } = product;
    batch.set(db.collection("products").doc(id), data, { merge: true });
  }

  await batch.commit();

  return NextResponse.json({
    ok: true,
    drops: MOCK_DROPS.length,
    products: MOCK_PRODUCTS.length,
  });
}
