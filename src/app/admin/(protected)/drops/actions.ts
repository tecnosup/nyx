"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminCreateDrop,
  adminDeleteDrop,
  adminDropSlugTaken,
  adminRestoreDrop,
  adminUpdateDrop,
  type DropInput,
} from "@/lib/admin-drops";
import { writeAudit } from "@/lib/admin-products";
import { slugify } from "@/lib/slug";
import type { DropStatus } from "@/lib/types";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

const STATUSES: DropStatus[] = ["upcoming", "active", "archived"];

function parseForm(formData: FormData): DropInput | { error: string } {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const slugRaw = (formData.get("slug") as string | null)?.trim() ?? "";
  const status = formData.get("status") as DropStatus | null;
  const releaseDateRaw = formData.get("releaseDate") as string | null;
  const heroImage = (formData.get("heroImage") as string | null)?.trim() ?? "";

  if (name.length < 2) return { error: "Nome muito curto." };
  if (name.length > 50) return { error: "Nome pode ter no máximo 50 caracteres." };
  if (description.length < 10) return { error: "Descrição muito curta." };
  if (description.length > 800) return { error: "Descrição pode ter no máximo 800 caracteres." };
  if (!status || !STATUSES.includes(status))
    return { error: "Status inválido." };

  if (!releaseDateRaw) return { error: "Data de lançamento obrigatória." };
  const ts = Date.parse(releaseDateRaw);
  if (!Number.isFinite(ts)) return { error: "Data inválida." };

  return {
    slug: slugRaw || slugify(name),
    name,
    description,
    releaseDate: ts,
    status,
    heroImage: heroImage || undefined,
  };
}

export async function createDropAction(
  formData: FormData
): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  const parsed = parseForm(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const slug = parsed.slug!;
  if (await adminDropSlugTaken(slug)) {
    return { ok: false, error: `Slug "${slug}" já existe.` };
  }

  const id = await adminCreateDrop(parsed);
  await writeAudit({
    actorUid: session.uid,
    actorEmail: session.email,
    action: "drop.create",
    entity: "drop",
    entityId: id,
    summary: parsed.name,
  });

  revalidatePath("/admin/drops");
  revalidatePath("/");
  redirect("/admin/drops");
}

export async function updateDropAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  const parsed = parseForm(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const slug = parsed.slug!;
  if (await adminDropSlugTaken(slug, id)) {
    return { ok: false, error: `Slug "${slug}" já existe.` };
  }

  await adminUpdateDrop(id, parsed);
  await writeAudit({
    actorUid: session.uid,
    actorEmail: session.email,
    action: "drop.update",
    entity: "drop",
    entityId: id,
    summary: parsed.name,
  });

  revalidatePath("/admin/drops");
  revalidatePath(`/admin/drops/${id}/editar`);
  revalidatePath("/");
  redirect("/admin/drops");
}

export async function deleteDropAction(id: string): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  await adminDeleteDrop(id);
  await writeAudit({
    actorUid: session.uid,
    actorEmail: session.email,
    action: "drop.delete",
    entity: "drop",
    entityId: id,
  });

  revalidatePath("/admin/drops");
  revalidatePath("/");
  return { ok: true };
}

export async function restoreDropAction(id: string): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  await adminRestoreDrop(id);
  await writeAudit({
    actorUid: session.uid,
    actorEmail: session.email,
    action: "drop.restore",
    entity: "drop",
    entityId: id,
  });

  revalidatePath("/admin/drops");
  revalidatePath("/");
  return { ok: true };
}
