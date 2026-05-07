import "server-only";
import { adminDb } from "./firebase-admin";

const COLLECTION = "gastos";
const CAT_COLLECTION = "gastoCategories";

export type GastoCategory = string;
export type GastoFrequency = "mensal" | "semanal" | "avulso";

export interface GastoCategoryItem {
  id: string;
  name: string;
  color: string; // hex
  createdAt: number;
}

const DEFAULT_CATEGORIES: Omit<GastoCategoryItem, "createdAt">[] = [
  { id: "aluguel",   name: "Aluguel",            color: "#F59E0B" },
  { id: "insumos",   name: "Insumos / Produtos",  color: "#3B82F6" },
  { id: "marketing", name: "Marketing",           color: "#8B5CF6" },
  { id: "logistica", name: "Logística",           color: "#06B6D4" },
  { id: "outros",    name: "Outros",              color: "#6B7280" },
];

export async function adminListGastoCategories(): Promise<GastoCategoryItem[]> {
  const db = adminDb();
  const snap = await db.collection(CAT_COLLECTION).get();
  if (!snap.empty) {
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as GastoCategoryItem)
      .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  }
  // Seed defaults on first call
  const now = Date.now();
  const batch = db.batch();
  for (const cat of DEFAULT_CATEGORIES) {
    batch.set(db.collection(CAT_COLLECTION).doc(cat.id), { name: cat.name, color: cat.color, createdAt: now });
  }
  await batch.commit();
  return DEFAULT_CATEGORIES.map((c) => ({ ...c, createdAt: now }));
}

export async function adminCreateGastoCategory(name: string, color: string): Promise<string> {
  const ref = await adminDb().collection(CAT_COLLECTION).add({ name, color, createdAt: Date.now() });
  return ref.id;
}

export async function adminUpdateGastoCategory(id: string, updates: Partial<Pick<GastoCategoryItem, "name" | "color">>): Promise<void> {
  await adminDb().collection(CAT_COLLECTION).doc(id).update(updates);
}

export async function adminDeleteGastoCategory(id: string): Promise<void> {
  await adminDb().collection(CAT_COLLECTION).doc(id).delete();
}

export interface Gasto {
  id: string;
  description: string;
  amount: number;
  frequency: GastoFrequency;
  category: GastoCategory;
  active: boolean;
  date?: string;           // "YYYY-MM-DD" — data específica do gasto
  remindRenewal?: boolean; // avisar sobre renovação
  dueDate?: string;        // "YYYY-MM-DD" — data de vencimento/renovação
  createdAt: number;
  updatedAt: number;
}

export interface CreateGastoInput {
  description: string;
  amount: number;
  frequency: GastoFrequency;
  category: GastoCategory;
  date?: string;
  remindRenewal?: boolean;
  dueDate?: string;
}

export async function adminCreateGasto(input: CreateGastoInput): Promise<string> {
  const now = Date.now();
  const data: Record<string, unknown> = {
    description: input.description,
    amount: input.amount,
    frequency: input.frequency,
    category: input.category,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  if (input.date) data.date = input.date;
  if (input.remindRenewal) data.remindRenewal = true;
  if (input.dueDate) data.dueDate = input.dueDate;
  const ref = await adminDb().collection(COLLECTION).add(data);
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
  updates: Partial<Pick<Gasto, "description" | "amount" | "frequency" | "category" | "active" | "date" | "remindRenewal" | "dueDate">>
): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ ...updates, updatedAt: Date.now() });
}

export function nextDueDate(dueDate: string, frequency: GastoFrequency): string {
  const [y, m, d] = dueDate.split("-").map(Number);
  if (frequency === "semanal") {
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 7);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  // mensal (default)
  let nm = m + 1, ny = y;
  if (nm > 12) { nm = 1; ny++; }
  return `${ny}-${String(nm).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export async function adminResolveGastoRenewal(id: string, newAmount?: number): Promise<void> {
  const db = adminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return;
  const data = doc.data()!;
  const frequency: GastoFrequency = data.frequency ?? "mensal";
  const currentDue: string = data.dueDate ?? "";
  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  if (currentDue) updates.dueDate = nextDueDate(currentDue, frequency);
  if (newAmount && newAmount > 0) updates.amount = newAmount;
  await db.collection(COLLECTION).doc(id).update(updates);
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
