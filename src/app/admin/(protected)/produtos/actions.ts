"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminIsSlugTaken,
  adminSetProductStatus,
  adminUpdateProduct,
  writeAudit,
  type ProductInput,
} from "@/lib/admin-products";
import { slugify } from "@/lib/slug";
import type {
  ColorStock,
  ProductSize,
  ProductStatus,
  SizeStock,
} from "@/lib/types";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

const SIZES: ProductSize[] = ["PP", "P", "M", "G", "GG", "UNICO"];
const STATUSES: ProductStatus[] = ["draft", "published"];

function parseForm(formData: FormData): ProductInput | { error: string } {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const category = (formData.get("category") as string | null)?.trim() ?? "";
  const pricePixRaw = formData.get("pricePix") as string | null;
  const priceCardRaw = formData.get("priceCard") as string | null;
  const dropIdRaw = formData.get("dropId") as string | null;
  const status = formData.get("status") as ProductStatus | null;
  const slugRaw = (formData.get("slug") as string | null)?.trim() ?? "";
  const isLimited = formData.get("isLimited") === "on";
  const imagesJson = (formData.get("images") as string | null) ?? "[]";
  const sizesJson = (formData.get("sizes") as string | null) ?? "[]";
  const colorsJson = (formData.get("colors") as string | null) ?? "[]";

  if (name.length < 2) return { error: "Nome muito curto." };
  if (description.length < 10) return { error: "Descrição muito curta." };
  if (!category) return { error: "Categoria obrigatória." };
  if (!status || !STATUSES.includes(status))
    return { error: "Status inválido." };

  const pricePix = parseFloat(pricePixRaw ?? "");
  if (!Number.isFinite(pricePix) || pricePix < 0)
    return { error: "Preço Pix inválido." };

  const priceCard = parseFloat(priceCardRaw ?? "");
  if (!Number.isFinite(priceCard) || priceCard < 0)
    return { error: "Preço Cartão inválido." };

  let images: string[];
  try {
    images = JSON.parse(imagesJson);
    if (!Array.isArray(images)) throw new Error();
  } catch {
    return { error: "Lista de imagens inválida." };
  }
  if (images.length === 0) return { error: "Envie pelo menos uma imagem." };
  if (images.length > 8) return { error: "Máximo 8 imagens." };

  let sizes: SizeStock[];
  try {
    const raw = JSON.parse(sizesJson);
    if (!Array.isArray(raw)) throw new Error();
    sizes = raw
      .filter((s) => s && SIZES.includes(s.size))
      .map((s) => ({ size: s.size, quantity: Number(s.quantity) || 0 }));
  } catch {
    return { error: "Lista de tamanhos inválida." };
  }
  if (sizes.length === 0) return { error: "Informe pelo menos um tamanho." };

  let colors: ColorStock[];
  try {
    const raw = JSON.parse(colorsJson);
    colors = Array.isArray(raw)
      ? raw
          .map((c) =>
            typeof c === "string"
              ? { name: c, soldOut: false }
              : { name: String(c?.name ?? ""), soldOut: Boolean(c?.soldOut) }
          )
          .filter((c) => c.name.trim().length > 0)
      : [];
  } catch {
    colors = [];
  }

  const dropId = dropIdRaw && dropIdRaw !== "" ? dropIdRaw : null;

  return {
    slug: slugRaw || slugify(name),
    name,
    description,
    category,
    pricePix,
    priceCard,
    colors,
    images,
    sizes,
    dropId,
    isLimited,
    status,
  };
}

export async function createProductAction(
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
  if (await adminIsSlugTaken(slug)) {
    return { ok: false, error: `Slug "${slug}" já existe.` };
  }

  const id = await adminCreateProduct(parsed);
  await writeAudit({
    actorUid: session.uid,
    actorEmail: session.email,
    action: "product.create",
    entity: "product",
    entityId: id,
    summary: parsed.name,
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath("/produtos");
  redirect("/admin/produtos");
}

export async function updateProductAction(
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
  if (await adminIsSlugTaken(slug, id)) {
    return { ok: false, error: `Slug "${slug}" já existe.` };
  }

  await adminUpdateProduct(id, parsed);
  await writeAudit({
    actorUid: session.uid,
    actorEmail: session.email,
    action: "product.update",
    entity: "product",
    entityId: id,
    summary: parsed.name,
  });

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}/editar`);
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath(`/produtos/${slug}`);
  redirect("/admin/produtos");
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  await adminDeleteProduct(id);
  await writeAudit({
    actorUid: session.uid,
    actorEmail: session.email,
    action: "product.delete",
    entity: "product",
    entityId: id,
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath("/produtos");
  return { ok: true };
}

export async function toggleProductStatusAction(
  id: string,
  status: ProductStatus
): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  await adminSetProductStatus(id, status);
  await writeAudit({
    actorUid: session.uid,
    actorEmail: session.email,
    action: `product.status.${status}`,
    entity: "product",
    entityId: id,
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath("/produtos");
  return { ok: true };
}
