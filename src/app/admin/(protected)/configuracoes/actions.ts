"use server";

import { revalidatePath } from "next/cache";
import { setFeaturedProduct } from "@/lib/admin-settings";

export async function setFeaturedProductAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const productId = formData.get("productId") as string | null;
  await setFeaturedProduct(productId || null);
  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
  return {};
}
