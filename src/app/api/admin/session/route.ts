import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { adminAuth, isAdminConfigured } from "@/lib/firebase-admin";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-session";
import { checkRate, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(await headers());
  const rate = checkRate(`admin-session:${ip}`, 10, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde e tente novamente." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
        },
      }
    );
  }

  if (!isAdminConfigured) {
    return NextResponse.json(
      { error: "Firebase Admin não configurado." },
      { status: 500 }
    );
  }

  let body: { idToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const idToken = body.idToken?.trim();
  if (!idToken) {
    return NextResponse.json(
      { error: "idToken é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const decoded = await adminAuth().verifyIdToken(idToken, true);
    if (decoded.admin !== true) {
      return NextResponse.json(
        { error: "Conta sem permissão de administrador." },
        { status: 403 }
      );
    }

    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const store = await cookies();
    store.set({
      name: SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return NextResponse.json({ ok: true, uid: decoded.uid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return NextResponse.json(
      { error: `Falha ao criar sessão: ${message}` },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
