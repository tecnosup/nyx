"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminSetOrderStatus,
  adminUpdateOrder,
  adminCreateOrder,
  adminGetOrder,
  adminGetPendingCaixaOrders,
  adminMarkOrdersInCaixa,
  adminUnmarkOrdersFromCaixa,
  adminDeleteOrder,
  type Order,
  type OrderStatus,
  type OrderItem,
} from "@/lib/admin-orders";
import { adminCloseCaixa, adminReopenCaixa } from "@/lib/admin-caixa";
import { adminAdjustStock } from "@/lib/admin-products";
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

  const order = await adminGetOrder(id);
  if (!order) return { ok: false, error: "Pedido não encontrado." };

  const stockItems = order.items.map((i) => ({ productId: i.productId, size: i.size, color: i.color }));

  if (status === "completed" && order.status !== "completed" && !order.stockDeducted) {
    await adminAdjustStock(stockItems, -1, { type: "venda", orderId: id });
    await adminSetOrderStatus(id, status, { stockDeducted: true });
  } else if (status === "cancelled" && order.status === "completed" && order.stockDeducted) {
    await adminAdjustStock(stockItems, 1, { type: "devolucao", orderId: id });
    await adminSetOrderStatus(id, status, { stockDeducted: false });
  } else {
    await adminSetOrderStatus(id, status);
  }

  revalidate();
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
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

  try {
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
      const stockItems = data.items.map((i) => ({ productId: i.productId, size: i.size, color: i.color }));
      await adminAdjustStock(stockItems, -1, { type: "venda" });
      await adminSetOrderStatus(id, "completed", { stockDeducted: true });

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
  } catch (err) {
    console.error("[createManualOrderAction]", err);
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { ok: false, error: `Erro ao registrar venda: ${msg}` };
  }
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

function orderDateStr(o: Order): string {
  if (o.saleDate) return o.saleDate;
  return new Date(o.createdAt).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");
}

export async function deleteOrderAction(orderId: string): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }

  // Restore stock if this was a completed order with stock deducted
  const order = await adminGetOrder(orderId);
  if (order?.status === "completed" && order.stockDeducted) {
    const stockItems = order.items.map((i) => ({ productId: i.productId, size: i.size, color: i.color }));
    await adminAdjustStock(stockItems, 1, { type: "devolucao", orderId: orderId });
  }

  await adminDeleteOrder(orderId);
  revalidate();
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return { ok: true };
}

export async function closeCaixaForDateAction(
  date: string
): Promise<ActionResult & { total?: number; count?: number }> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Sessão inválida." }; }

  const allPending = await adminGetPendingCaixaOrders();
  const orders = allPending.filter((o) => orderDateStr(o) === date);

  if (orders.length === 0) return { ok: false, error: "Nenhum pedido para esta data." };

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
