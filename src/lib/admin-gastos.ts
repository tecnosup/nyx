import "server-only";
import { adminDb } from "./firebase-admin";

const COLLECTION = "gastos";

export type GastoCategory = "aluguel" | "insumos" | "marketing" | "logistica" | "outros";
export type GastoFrequency = "mensal" | "semanal" | "avulso";

export interface Gasto {
  id: string;
  description: string;
  amount: number;
  frequency: GastoFrequency;
  category: GastoCategory;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateGastoInput {
  description: string;
  amount: number;
  frequency: GastoFrequency;
  category: GastoCategory;
}

export async function adminCreateGasto(input: CreateGastoInput): Promise<string> {
  const now = Date.now();
  const ref = await adminDb().collection(COLLECTION).add({
    ...input,
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function adminListGastos(): Promise<Gasto[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Gasto);
}

export async function adminUpdateGasto(
  id: string,
  updates: Partial<Pick<Gasto, "description" | "amount" | "frequency" | "category" | "active">>
): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ ...updates, updatedAt: Date.now() });
}

export async function adminDeleteGasto(id: string): Promise<void> {
  await adminDb().collection(COLLECTION).doc(id).delete();
}

export async function adminGastoStats(): Promise<{
  monthlyTotal: number;
  activeCount: number;
}> {
  const snap = await adminDb().collection(COLLECTION).where("active", "==", true).get();
  const gastos = snap.docs.map((d) => d.data() as Omit<Gasto, "id">);

  let monthlyTotal = 0;
  for (const g of gastos) {
    if (g.frequency === "mensal") monthlyTotal += g.amount;
    else if (g.frequency === "semanal") monthlyTotal += g.amount * 4;
    // avulso não entra no recorrente mensal
  }

  return { monthlyTotal, activeCount: gastos.length };
}
