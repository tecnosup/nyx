import "server-only";
import { adminDb } from "./firebase-admin";

const COLLECTION = "stockMovements";

export type StockMovementType = "venda" | "devolucao" | "reposicao" | "ajuste";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  size: string;
  delta: number;       // positive = entrada, negative = saída
  type: StockMovementType;
  orderId?: string;
  notes?: string;
  date: string;        // "YYYY-MM-DD"
  createdAt: number;
}

export const MOVEMENT_LABELS: Record<StockMovementType, string> = {
  venda:     "Venda",
  devolucao: "Devolução",
  reposicao: "Reposição",
  ajuste:    "Ajuste manual",
};

export async function adminListStockMovements(options?: {
  productId?: string;
  limit?: number;
}): Promise<StockMovement[]> {
  let query = adminDb().collection(COLLECTION) as FirebaseFirestore.Query;

  if (options?.productId) {
    query = query.where("productId", "==", options.productId);
  }

  const snap = await query.get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StockMovement);

  // Sort by createdAt desc in memory (avoids composite index requirement)
  docs.sort((a, b) => b.createdAt - a.createdAt);

  return options?.limit ? docs.slice(0, options.limit) : docs;
}

export async function adminLogStockMovement(
  movement: Omit<StockMovement, "id">
): Promise<void> {
  await adminDb().collection(COLLECTION).add(movement);
}
