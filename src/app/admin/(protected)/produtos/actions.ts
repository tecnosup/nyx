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
  adminRestockProduct,
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
  const compareAtPixRaw = formData.get("compareAtPricePix") as string | null;
  const compareAtCardRaw = formData.get("compareAtPriceCard") as string | null;
  const dropIdRaw = formData.get("dropId") as string | null;
  const status = formData.get("status") as ProductStatus | null;
  const slugRaw = (formData.get("slug") as string | null)?.trim() ?? "";
  const isLimited = formData.get("isLimited") === "on";
  const imagesJson = (formData.get("images") as string | null) ?? "[]";
  const sizesJson = (formData.get("sizes") as string | null) ?? "[]";
  const colorsJson = (formData.get("colors") as string | null) ?? "[]";

  if (name.length < 2) return { error: "Nome muito curto." };
  if (name.length > 60) return { error: "Nome pode ter no máximo 60 caracteres." };
  if (description.length < 10) return { error: "Descrição muito curta." };
  if (description.length > 600) return { error: "Descrição pode ter no máximo 600 caracteres." };
  if (!category) return { error: "Categoria obrigatória." };
  if (!status || !STATUSES.includes(status))
    return { error: "Status inválido." };

  const pricePix = parseFloat(pricePixRaw ?? "");
  if (!Number.isFinite(pricePix) || pricePix <= 0)
    return { error: "Preço Pix obrigatório." };

  if (status === "published" && (!pricePixRaw || pricePix <= 0))
    return { error: "Preço Pix é obrigatório para publicar o produto." };

  const priceCardRawTrimmed = priceCardRaw?.trim() ?? "";
  const priceCard = priceCardRawTrimmed === "" ? 0 : parseFloat(priceCardRawTrimmed);
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

  let colors: ColorStock[];
  try {
    const raw = JSON.parse(colorsJson);
    colors = Array.isArray(raw)
      ? raw
          .map((c) =>
            typeof c === "string"
              ? { name: c, soldOut: false, sizes: [] }
              : {
                  name: String(c?.name ?? ""),
                  soldOut: Boolean(c?.soldOut),
                  sizes: Array.isArray(c?.sizes) ? c.sizes : [],
                }
          )
          .filter((c) => c.name.trim().length > 0)
      : [];
  } catch {
    colors = [];
  }

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
  const colorsHaveSizes = colors.some((c) => Array.isArray(c.sizes) && c.sizes.length > 0);
  if (sizes.length === 0 && !colorsHaveSizes) return { error: "Informe pelo menos um tamanho." };

  const dropId = dropIdRaw && dropIdRaw !== "" ? dropIdRaw : null;

  const compareAtPricePix = compareAtPixRaw?.trim() ? parseFloat(compareAtPixRaw) : undefined;
  const compareAtPriceCard = compareAtCardRaw?.trim() ? parseFloat(compareAtCardRaw) : undefined;

  return {
    slug: slugRaw || slugify(name),
    name,
    description,
    category,
    pricePix,
    priceCard,
    compareAtPricePix: Number.isFinite(compareAtPricePix) ? compareAtPricePix : undefined,
    compareAtPriceCard: Number.isFinite(compareAtPriceCard) ? compareAtPriceCard : undefined,
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
  revalidatePath("/produtos/categoria", "layout");
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
  revalidatePath("/produtos/categoria", "layout");
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
  revalidatePath("/produtos/categoria", "layout");
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
  revalidatePath("/produtos/categoria", "layout");
  return { ok: true };
}

export async function restockProductAction(data: {
  productId: string;
  size: string;
  quantity: number;
  notes?: string;
  color?: string;
}): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  if (!data.productId) return { ok: false, error: "Produto obrigatório." };
  if (!data.size) return { ok: false, error: "Tamanho obrigatório." };
  if (!Number.isFinite(data.quantity) || data.quantity <= 0)
    return { ok: false, error: "Quantidade deve ser maior que zero." };
  await adminRestockProduct(data.productId, data.size, data.quantity, data.notes, data.color);
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return { ok: true };
}
