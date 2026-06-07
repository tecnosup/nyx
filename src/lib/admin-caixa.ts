import "server-only";
import { adminDb } from "./firebase-admin";
import {
  adminGetPendingCaixaOrders,
  adminMarkOrdersInCaixa,
  type Order,
} from "./admin-orders";

const COLLECTION = "caixas";

export interface Caixa {
  id: string;
  date: string; // "YYYY-MM-DD"
  orderIds: string[];
  orderCount: number;
  totalPix: number;
  totalCard: number;
  totalTransferencia: number;
  totalCombinar: number;
  totalGeral: number;
  closedAt: number;
}

function getOrderDate(o: Order): string {
  if (o.saleDate) return o.saleDate;
  return new Date(o.createdAt).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split("/").reverse().join("-");
}

async function getCaixaByDate(date: string): Promise<Caixa | null> {
  const snap = await adminDb().collection(COLLECTION).where("date", "==", date).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Caixa;
}

// Groups pending orders by date and upserts one caixa per day.
// Returns array of { caixaId, orderIds } for marking.
export async function adminCloseCaixa(
  orders: Order[]
): Promise<Array<{ caixaId: string; orderIds: string[] }>> {
  if (orders.length === 0) throw new Error("Nenhum pedido concluído para fechar o caixa.");

  const byDate: Record<string, Order[]> = {};
  for (const o of orders) {
    const date = getOrderDate(o);
    (byDate[date] ??= []).push(o);
  }

  const result: Array<{ caixaId: string; orderIds: string[] }> = [];
  const now = Date.now();

  for (const [date, dateOrders] of Object.entries(byDate)) {
    let totalPix = 0, totalCard = 0, totalTransferencia = 0, totalCombinar = 0;
    for (const o of dateOrders) {
      if (o.paymentMethod === "pix") totalPix += o.totalPix;
      else if (o.paymentMethod === "cartao") totalCard += o.totalCard;
      else if (o.paymentMethod === "transferencia") totalTransferencia += o.totalPix;
      else totalCombinar += o.totalPix;
    }
    const totalGeral = totalPix + totalCard + totalTransferencia + totalCombinar;
    const newOrderIds = dateOrders.map((o) => o.id);

    const existing = await getCaixaByDate(date);
    if (existing) {
      const mergedIds = [...new Set([...existing.orderIds, ...newOrderIds])];
      await adminDb().collection(COLLECTION).doc(existing.id).update({
        orderIds: mergedIds,
        orderCount: mergedIds.length,
        totalPix: existing.totalPix + totalPix,
        totalCard: existing.totalCard + totalCard,
        totalTransferencia: existing.totalTransferencia + totalTransferencia,
        totalCombinar: existing.totalCombinar + totalCombinar,
        totalGeral: existing.totalGeral + totalGeral,
        closedAt: now,
      });
      result.push({ caixaId: existing.id, orderIds: newOrderIds });
    } else {
      const ref = await adminDb().collection(COLLECTION).add({
        date,
        orderIds: newOrderIds,
        orderCount: newOrderIds.length,
        totalPix,
        totalCard,
        totalTransferencia,
        totalCombinar,
        totalGeral,
        closedAt: now,
      });
      result.push({ caixaId: ref.id, orderIds: newOrderIds });
    }
  }

  return result;
}

// Deletes the caixa document and returns its orderIds so they can be unmarked.
export async function adminReopenCaixa(caixaId: string): Promise<string[]> {
  const doc = await adminDb().collection(COLLECTION).doc(caixaId).get();
  if (!doc.exists) throw new Error("Caixa não encontrado.");
  const caixa = { id: doc.id, ...doc.data() } as Caixa;
  await adminDb().collection(COLLECTION).doc(caixaId).delete();
  return caixa.orderIds;
}

// Closes the caixa for every past day (before today, America/Sao_Paulo) that
// still has completed orders without a caixaId. Used by the daily cron job —
// any day left open by the admin is auto-closed at the end of the following day's run.
export async function adminAutoCloseStaleCaixas(): Promise<Array<{ date: string; count: number; total: number }>> {
  const today = new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");

  const pending = await adminGetPendingCaixaOrders();
  const stale = pending.filter((o) => getOrderDate(o) < today);
  if (stale.length === 0) return [];

  const groups = await adminCloseCaixa(stale);
  for (const { caixaId, orderIds } of groups) {
    await adminMarkOrdersInCaixa(orderIds, caixaId);
  }

  const byDate: Record<string, Order[]> = {};
  for (const o of stale) (byDate[getOrderDate(o)] ??= []).push(o);

  return Object.entries(byDate).map(([date, dateOrders]) => ({
    date,
    count: dateOrders.length,
    total: dateOrders.reduce((s, o) => s + o.totalPix, 0),
  }));
}

// Returns the distinct dates (before today, America/Sao_Paulo) that still have
// completed orders without a caixaId — i.e. caixas que deveriam ter sido
// fechados ao virar o dia. Usado para alertar o admin no painel.
export async function adminGetOpenCaixaDates(): Promise<string[]> {
  const today = new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");

  const pending = await adminGetPendingCaixaOrders();
  const dates = new Set<string>();
  for (const o of pending) {
    const d = getOrderDate(o);
    if (d < today) dates.add(d);
  }
  return [...dates].sort();
}

export async function adminListCaixas(limitCount?: number): Promise<Caixa[]> {
  let query = adminDb().collection(COLLECTION).orderBy("closedAt", "desc") as FirebaseFirestore.Query;
  if (limitCount) query = query.limit(limitCount);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Caixa);
}
