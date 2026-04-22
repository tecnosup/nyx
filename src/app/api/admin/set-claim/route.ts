import { NextResponse } from "next/server";
import { adminAuth, isAdminConfigured } from "@/lib/firebase-admin";

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

  let body: { email?: string; admin?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const admin = body.admin ?? true;

  if (!email) {
    return NextResponse.json(
      { error: "Campo 'email' é obrigatório." },
      { status: 400 }
    );
  }

  const auth = adminAuth();

  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, admin ? { admin: true } : {});
    return NextResponse.json({
      ok: true,
      uid: user.uid,
      email: user.email,
      admin,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return NextResponse.json(
      { error: `Falha ao setar claim: ${message}` },
      { status: 500 }
    );
  }
}
