"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminUpdateCategory,
  adminCategorySlugTaken,
} from "@/lib/admin-categories";
import { slugify } from "@/lib/slug";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCategoryAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  const label = (formData.get("label") as string | null)?.trim() ?? "";
  const slugRaw = (formData.get("slug") as string | null)?.trim() ?? "";

  if (label.length < 2) return { ok: false, error: "Nome muito curto." };

  const slug = slugRaw || slugify(label);
  if (await adminCategorySlugTaken(slug)) {
    return { ok: false, error: `Slug "${slug}" já existe.` };
  }

  await adminCreateCategory({ label, slug });
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos", "layout");
  redirect("/admin/categorias");
}

export async function updateCategoryAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  const label = (formData.get("label") as string | null)?.trim() ?? "";
  const slugRaw = (formData.get("slug") as string | null)?.trim() ?? "";

  if (label.length < 2) return { ok: false, error: "Nome muito curto." };

  const slug = slugRaw || slugify(label);
  if (await adminCategorySlugTaken(slug, id)) {
    return { ok: false, error: `Slug "${slug}" já existe.` };
  }

  await adminUpdateCategory(id, { label, slug });
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos", "layout");
  redirect("/admin/categorias");
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  await adminDeleteCategory(id);
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos", "layout");
  return { ok: true };
}
