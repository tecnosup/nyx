"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { adminSetOrderStatus, type OrderStatus } from "@/lib/admin-orders";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function setOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  await adminSetOrderStatus(id, status);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return { ok: true };
}
