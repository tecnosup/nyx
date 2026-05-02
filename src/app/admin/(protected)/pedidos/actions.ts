"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminSetOrderStatus,
  adminUpdateOrder,
  adminCreateOrder,
  adminGetPendingCaixaOrders,
  adminMarkOrdersInCaixa,
  adminUnmarkOrdersFromCaixa,
  type Order,
  type OrderStatus,
  type OrderItem,
} from "@/lib/admin-orders";
import { adminCloseCaixa, adminReopenCaixa } from "@/lib/admin-caixa";
import type { PaymentMethod } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function setOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  await adminSetOrderStatus(id, status);
  revalidate();
  return { ok: true };
}

export async function updateOrderAction(
  id: string,
  updates: {
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
    items?: OrderItem[];
  }
): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }
  await adminUpdateOrder(id, updates);
  revalidate();
  return { ok: true };
}

export async function createManualOrderAction(data: {
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: OrderItem[];
  saleDate?: string;
  createAsCompleted?: boolean;
}): Promise<ActionResult & { id?: string }> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }

  if (!data.customerName.trim()) return { ok: false, error: "Nome do cliente obrigatório." };
  if (data.items.length === 0) return { ok: false, error: "Adicione ao menos um item." };

  const now = Date.now();
  const id = await adminCreateOrder({
    type: "manual",
    customerName: data.customerName.trim(),
    customerPhone: data.customerPhone.trim(),
    paymentMethod: data.paymentMethod,
    notes: data.notes?.trim(),
    items: data.items,
    saleDate: data.saleDate,
  });

  if (data.createAsCompleted) {
    await adminSetOrderStatus(id, "completed");

    // Auto-close into the caixa for that date (past or today)
    const totalPix = data.items.reduce((s, i) => s + i.pricePix, 0);
    const totalCard = data.items.reduce((s, i) => s + i.priceCard, 0);
    const fakeOrder: Order = {
      id,
      type: "manual",
      status: "completed",
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      paymentMethod: data.paymentMethod,
      items: data.items,
      totalPix,
      totalCard,
      saleDate: data.saleDate,
      createdAt: now,
      updatedAt: now,
    };
    const groups = await adminCloseCaixa([fakeOrder]);
    for (const { caixaId, orderIds } of groups) {
      await adminMarkOrdersInCaixa(orderIds, caixaId);
    }
    revalidatePath("/admin/financeiro");
  }

  revalidate();
  return { ok: true, id };
}

export async function closeCaixaAction(): Promise<ActionResult & { total?: number; count?: number }> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }

  const orders = await adminGetPendingCaixaOrders();
  if (orders.length === 0) {
    return { ok: false, error: "Nenhum pedido concluído para fechar o caixa." };
  }

  const groups = await adminCloseCaixa(orders);

  for (const { caixaId, orderIds } of groups) {
    await adminMarkOrdersInCaixa(orderIds, caixaId);
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");

  const total = orders.reduce((s, o) => s + o.totalPix, 0);
  return { ok: true, total, count: orders.length };
}

export async function reopenCaixaAction(caixaId: string): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }

  const orderIds = await adminReopenCaixa(caixaId);
  await adminUnmarkOrdersFromCaixa(orderIds);

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");

  return { ok: true };
}
