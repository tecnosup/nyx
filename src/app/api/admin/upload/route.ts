import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin-session";
import { adminStorage, isAdminConfigured } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_BYTES = 8 * 1024 * 1024;

function extFor(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "bin";
}

export async function POST(req: Request) {
  if (!isAdminConfigured) {
    return NextResponse.json(
      { error: "Firebase Admin não configurado." },
      { status: 500 }
    );
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "multipart/form-data inválido." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  const folder = (form.get("folder") as string | null)?.trim() || "products";

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Campo 'file' obrigatório." },
      { status: 400 }
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Tipo ${file.type || "desconhecido"} não permitido.` },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Arquivo acima de ${MAX_BYTES / (1024 * 1024)}MB.` },
      { status: 400 }
    );
  }

  const bucket = adminStorage().bucket();
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "_").slice(0, 80);
  const path = `${safeFolder}/${Date.now()}-${randomUUID()}.${extFor(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const fileRef = bucket.file(path);
  const token = randomUUID();

  await fileRef.save(buffer, {
    contentType: file.type,
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    path
  )}?alt=media&token=${token}`;

  return NextResponse.json({ ok: true, url, path });
}

export async function DELETE(req: Request) {
  if (!isAdminConfigured) {
    return NextResponse.json(
      { error: "Firebase Admin não configurado." },
      { status: 500 }
    );
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  let body: { path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const path = body.path?.trim();
  if (!path) {
    return NextResponse.json(
      { error: "Campo 'path' é obrigatório." },
      { status: 400 }
    );
  }

  try {
    await adminStorage().bucket().file(path).delete({ ignoreNotFound: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return NextResponse.json(
      { error: `Falha ao remover: ${message}` },
      { status: 500 }
    );
  }
}
