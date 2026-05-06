import "server-only";
import { adminDb } from "./firebase-admin";
import type { Order } from "./admin-orders";

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

export async function adminListCaixas(limitCount = 90): Promise<Caixa[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("closedAt", "desc")
    .limit(limitCount)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Caixa);
}
