"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminCreateGasto,
  adminUpdateGasto,
  adminDeleteGasto,
  type GastoCategory,
  type GastoFrequency,
} from "@/lib/admin-gastos";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/admin/financeiro");
}

export async function createGastoAction(data: {
  description: string;
  amount: number;
  frequency: GastoFrequency;
  category: GastoCategory;
}): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  if (!data.description.trim()) return { ok: false, error: "Descrição obrigatória." };
  if (data.amount <= 0) return { ok: false, error: "Valor deve ser maior que zero." };
  await adminCreateGasto({ ...data, description: data.description.trim() });
  revalidate();
  return { ok: true };
}

export async function updateGastoAction(
  id: string,
  updates: { description?: string; amount?: number; frequency?: GastoFrequency; category?: GastoCategory; active?: boolean }
): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  await adminUpdateGasto(id, updates);
  revalidate();
  return { ok: true };
}

export async function deleteGastoAction(id: string): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  await adminDeleteGasto(id);
  revalidate();
  return { ok: true };
}
