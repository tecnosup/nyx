import "server-only";
import { adminDb } from "./firebase-admin";
import type { PaymentMethod, ShippingAddress } from "./types";

const COLLECTION = "orders";

export type OrderStatus = "pending" | "confirmed" | "cancelled";
export type OrderType = "single" | "cart" | "backorder";

export interface OrderItem {
  productId: string;
  productSlug: string;
  productName: string;
  size: string;
  color?: string;
  pricePix: number;
  priceCard: number;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  totalPix: number;
  totalCard: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateOrderInput {
  type: OrderType;
  customerName: string;
  customerPhone: string;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  notes?: string;
}

function calcTotals(items: OrderItem[]) {
  return {
    totalPix: items.reduce((s, i) => s + i.pricePix, 0),
    totalCard: items.reduce((s, i) => s + i.priceCard, 0),
  };
}

export async function adminCreateOrder(input: CreateOrderInput): Promise<string> {
  const now = Date.now();
  const ref = await adminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      ...calcTotals(input.items),
      status: "pending" as OrderStatus,
      createdAt: now,
      updatedAt: now,
    });
  return ref.id;
}

export async function adminListOrders(limitCount = 200): Promise<Order[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limitCount)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order);
}

export async function adminGetOrder(id: string): Promise<Order | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Order;
}

export async function adminSetOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ status, updatedAt: Date.now() });
}

export async function adminOrderStats(): Promise<{
  totalConfirmed: number;
  revenuePix: number;
  revenueCard: number;
  pending: number;
  thisMonth: number;
}> {
  const snap = await adminDb().collection(COLLECTION).get();
  const orders = snap.docs.map((d) => ({ ...d.data() }) as Omit<Order, "id">);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let totalConfirmed = 0;
  let revenuePix = 0;
  let revenueCard = 0;
  let pending = 0;
  let thisMonth = 0;

  for (const o of orders) {
    if (o.status === "confirmed") {
      totalConfirmed++;
      revenuePix += o.totalPix;
      revenueCard += o.totalCard;
    }
    if (o.status === "pending") pending++;
    if (o.createdAt >= startOfMonth.getTime()) thisMonth++;
  }

  return { totalConfirmed, revenuePix, revenueCard, pending, thisMonth };
}
