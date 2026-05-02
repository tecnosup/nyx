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

export async function adminCloseCaixa(orders: Order[]): Promise<string> {
  if (orders.length === 0) throw new Error("Nenhum pedido concluído para fechar o caixa.");

  const now = Date.now();
  const date = new Date(now).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split("/").reverse().join("-");

  let totalPix = 0;
  let totalCard = 0;
  let totalTransferencia = 0;
  let totalCombinar = 0;

  for (const o of orders) {
    const val = o.totalPix;
    if (o.paymentMethod === "pix") totalPix += val;
    else if (o.paymentMethod === "cartao") totalCard += o.totalCard;
    else if (o.paymentMethod === "transferencia") totalTransferencia += val;
    else totalCombinar += val;
  }

  const totalGeral = totalPix + totalCard + totalTransferencia + totalCombinar;

  const ref = await adminDb().collection(COLLECTION).add({
    date,
    orderIds: orders.map((o) => o.id),
    orderCount: orders.length,
    totalPix,
    totalCard,
    totalTransferencia,
    totalCombinar,
    totalGeral,
    closedAt: now,
  });

  return ref.id;
}

export async function adminListCaixas(limitCount = 90): Promise<Caixa[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("closedAt", "desc")
    .limit(limitCount)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Caixa);
}
