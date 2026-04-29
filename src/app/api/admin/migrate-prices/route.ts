import { NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized(reason: string) {
  return NextResponse.json({ error: reason }, { status: 401 });
}

// Preenche pricePix e priceCard em produtos que ainda não têm esses campos.
// Usa `price` como fallback se existir; caso contrário deixa 0 para edição manual.
export async function POST(req: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) return unauthorized("SEED_SECRET não configurado no servidor.");

  const header = req.headers.get("x-seed-secret");
  if (header !== secret) return unauthorized("Secret inválido.");

  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Firebase Admin não configurado." }, { status: 500 });
  }

  const db = adminDb();
  const snap = await db.collection("products").get();

  const batch = db.batch();
  let migrated = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const needsMigration =
      data.pricePix === undefined || data.pricePix === null ||
      data.priceCard === undefined || data.priceCard === null;

    if (!needsMigration) continue;

    const legacyPrice = typeof data.price === "number" ? data.price : 0;
    batch.update(doc.ref, {
      pricePix: data.pricePix ?? legacyPrice,
      priceCard: data.priceCard ?? Math.round(legacyPrice * 1.1),
    });
    migrated++;
  }

  if (migrated > 0) await batch.commit();

  return NextResponse.json({ ok: true, total: snap.size, migrated });
}
