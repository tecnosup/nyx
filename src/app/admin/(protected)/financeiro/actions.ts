"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminCreateGasto,
  adminUpdateGasto,
  adminDeleteGasto,
  adminCreateGastoCategory,
  adminUpdateGastoCategory,
  adminDeleteGastoCategory,
  type GastoCategory,
  type GastoFrequency,
  type Gasto,
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
  date?: string;
  remindRenewal?: boolean;
  dueDate?: string;
}): Promise<ActionResult & { gasto?: Gasto }> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  if (!data.description.trim()) return { ok: false, error: "Descrição obrigatória." };
  if (data.amount <= 0) return { ok: false, error: "Valor deve ser maior que zero." };
  const id = await adminCreateGasto({ ...data, description: data.description.trim() });
  revalidate();
  const now = Date.now();
  const gasto: Gasto = {
    id, description: data.description.trim(), amount: data.amount,
    frequency: data.frequency, category: data.category, active: true,
    date: data.date, remindRenewal: data.remindRenewal, dueDate: data.dueDate,
    createdAt: now, updatedAt: now,
  };
  return { ok: true, gasto };
}

export async function updateGastoAction(
  id: string,
  updates: {
    description?: string; amount?: number; frequency?: GastoFrequency;
    category?: GastoCategory; active?: boolean;
    date?: string; remindRenewal?: boolean; dueDate?: string;
  }
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

export async function createGastoCategoryAction(name: string, color: string): Promise<ActionResult & { id?: string }> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  if (!name.trim()) return { ok: false, error: "Nome obrigatório." };
  const id = await adminCreateGastoCategory(name.trim(), color);
  revalidate();
  return { ok: true, id };
}

export async function updateGastoCategoryAction(id: string, updates: { name?: string; color?: string }): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  await adminUpdateGastoCategory(id, updates);
  revalidate();
  return { ok: true };
}

export async function deleteGastoCategoryAction(id: string): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  await adminDeleteGastoCategory(id);
  revalidate();
  return { ok: true };
}
