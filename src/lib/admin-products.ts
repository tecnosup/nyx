import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";
import { slugify } from "./slug";
import {
  normalizeColors,
  type ColorStock,
  type Product,
  type ProductCategory,
  type ProductStatus,
  type SizeStock,
} from "./types";

const COLLECTION = "products";

export interface ProductInput {
  slug?: string;
  name: string;
  description: string;
  category: ProductCategory;
  pricePix: number;
  priceCard: number;
  compareAtPricePix?: number;
  compareAtPriceCard?: number;
  colors: ColorStock[];
  images: string[];
  sizes: SizeStock[];
  dropId: string | null;
  isLimited: boolean;
  status: ProductStatus;
}

function aggregateSizesFromColors(colors: ColorStock[]): SizeStock[] | null {
  const hasSizes = colors.some((c) => c.sizes && c.sizes.length > 0);
  if (!hasSizes) return null;
  const map: Record<string, number> = {};
  for (const c of colors) {
    for (const s of (c.sizes ?? [])) {
      map[s.size] = (map[s.size] ?? 0) + s.quantity;
    }
  }
  return Object.entries(map).map(([size, quantity]) => ({ size: size as SizeStock["size"], quantity }));
}

function sanitize(input: ProductInput): Omit<Product, "id" | "createdAt" | "updatedAt" | "compareAtPricePix" | "compareAtPriceCard"> & { compareAtPricePix?: number; compareAtPriceCard?: number } {
  const compareAtPricePix = (input.compareAtPricePix && input.compareAtPricePix > input.pricePix)
    ? Math.round(input.compareAtPricePix * 100) / 100
    : null;
  const compareAtPriceCard = (input.compareAtPriceCard && input.compareAtPriceCard > input.priceCard && input.priceCard > 0)
    ? Math.round(input.compareAtPriceCard * 100) / 100
    : null;

  const colors = (input.colors ?? [])
    .filter((c) => c.name.trim().length > 0)
    .slice(0, 5)
    .map((c) => ({
      name: c.name.trim(),
      soldOut: Boolean(c.soldOut),
      sizes: (c.sizes ?? []).map((s) => ({ size: s.size, quantity: Math.max(0, Math.round(s.quantity)) })),
    }));

  const aggregated = aggregateSizesFromColors(colors);
  const sizes = aggregated
    ? aggregated
    : input.sizes
        .map((s) => ({ size: s.size, quantity: Math.max(0, Math.round(s.quantity)) }))
        .filter((s, idx, arr) => arr.findIndex((x) => x.size === s.size) === idx);

  const base = {
    slug: slugify(input.slug ?? input.name),
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category,
    pricePix: Math.round(input.pricePix * 100) / 100,
    priceCard: Math.round(input.priceCard * 100) / 100,
    colors,
    images: input.images.filter((url) => url.trim().length > 0),
    sizes,
    dropId: input.dropId,
    isLimited: Boolean(input.isLimited),
    status: input.status,
    ...(compareAtPricePix !== null ? { compareAtPricePix } : {}),
    ...(compareAtPriceCard !== null ? { compareAtPriceCard } : {}),
  };
  return base;
}

function toProduct(id: string, data: FirebaseFirestore.DocumentData): Product {
  return { id, ...data, colors: normalizeColors(data.colors) } as Product;
}

export async function adminListProducts(): Promise<Product[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("updatedAt", "desc")
    .get();
  return snap.docs
    .filter((doc) => !doc.data().deleted)
    .map((doc) => toProduct(doc.id, doc.data()));
}

export async function adminListDeletedProducts(): Promise<Product[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("updatedAt", "desc")
    .get();
  return snap.docs
    .filter((doc) => doc.data().deleted === true)
    .map((doc) => toProduct(doc.id, doc.data()));
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toProduct(doc.id, doc.data()!);
}

export async function adminCreateProduct(input: ProductInput): Promise<string> {
  const data = sanitize(input);
  const now = Date.now();
  const ref = await adminDb()
    .collection(COLLECTION)
    .add({ ...data, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function adminUpdateProduct(
  id: string,
  input: ProductInput
): Promise<void> {
  const data = sanitize(input);
  const db = adminDb();
  const now = Date.now();

  let oldSizes: Array<{ size: string; quantity: number }> = [];
  let productName = input.name;

  await db.runTransaction(async (tx) => {
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await tx.get(ref);
    if (doc.exists) {
      oldSizes = doc.data()?.sizes ?? [];
      productName = doc.data()?.name ?? input.name;
    }
    tx.update(ref, { ...data, updatedAt: now });
  });

  // Log stock adjustments for any size quantity changes
  const newSizes: Array<{ size: string; quantity: number }> = data.sizes;
  const allSizes = new Set([...oldSizes.map((s) => s.size), ...newSizes.map((s) => s.size)]);
  const movements: Array<{ size: string; delta: number }> = [];

  for (const size of allSizes) {
    const oldQty = oldSizes.find((s) => s.size === size)?.quantity ?? 0;
    const newQty = newSizes.find((s) => s.size === size)?.quantity ?? 0;
    const delta = newQty - oldQty;
    if (delta !== 0) movements.push({ size, delta });
  }

  if (movements.length > 0) {
    const date = spDate(now);
    await Promise.all(
      movements.map(({ size, delta }) =>
        db.collection("stockMovements").add({
          productId: id,
          productName,
          size,
          delta,
          type: "ajuste",
          date,
          createdAt: now,
        })
      )
    );
  }
}

export interface StockAdjustMeta {
  type?: "venda" | "devolucao" | "reposicao" | "ajuste";
  orderId?: string;
  notes?: string;
}

function spDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");
}

/**
 * Adjusts stock for a set of order items and logs each movement.
 * delta = -1 to decrement (on completion), +1 to restore (on cancellation).
 * Uses a Firestore transaction per product to avoid race conditions.
 */
export async function adminAdjustStock(
  items: Array<{ productId: string; size: string }>,
  delta: -1 | 1,
  meta?: StockAdjustMeta
): Promise<void> {
  const byProduct: Record<string, Record<string, number>> = {};
  for (const item of items) {
    if (item.productId === "manual") continue;
    byProduct[item.productId] ??= {};
    byProduct[item.productId][item.size] = (byProduct[item.productId][item.size] ?? 0) + 1;
  }

  const db = adminDb();
  const productIds = Object.keys(byProduct);
  if (productIds.length === 0) return;

  const movType = meta?.type ?? (delta < 0 ? "venda" : "devolucao");
  const now = Date.now();
  const date = spDate(now);

  const movements: Array<{ productId: string; productName: string; size: string; delta: number }> = [];

  await db.runTransaction(async (tx) => {
    for (const productId of productIds) {
      const ref = db.collection(COLLECTION).doc(productId);
      const doc = await tx.get(ref);
      if (!doc.exists) continue;

      const productName: string = doc.data()?.name ?? productId;
      const sizes: Array<{ size: string; quantity: number }> = doc.data()?.sizes ?? [];
      const sizeDelta = byProduct[productId];

      const updatedSizes = sizes.map((s) => {
        const change = sizeDelta[s.size] ?? 0;
        if (change === 0) return s;
        const newQty = delta > 0 ? s.quantity + change : Math.max(0, s.quantity - change);
        return { ...s, quantity: newQty };
      });

      tx.update(ref, { sizes: updatedSizes, updatedAt: now });

      // Collect movements to write after transaction
      for (const [size, count] of Object.entries(sizeDelta)) {
        movements.push({ productId, productName, size, delta: delta * count });
      }
    }
  });

  // Write movement logs outside the transaction for reliability
  await Promise.all(movements.map(({ productId, productName, size, delta: d }) => {
    const movement: Record<string, unknown> = {
      productId, productName, size, delta: d,
      type: movType, date, createdAt: now,
    };
    if (meta?.orderId) movement.orderId = meta.orderId;
    if (meta?.notes) movement.notes = meta.notes;
    return db.collection("stockMovements").add(movement);
  }));
}

/**
 * Adds stock for a specific product size (manual restock).
 * If color is provided, also updates that color's sizes breakdown.
 */
export async function adminRestockProduct(
  productId: string,
  size: string,
  quantity: number,
  notes?: string,
  color?: string,
): Promise<void> {
  if (quantity <= 0) throw new Error("Quantidade deve ser maior que zero.");
  const db = adminDb();
  const now = Date.now();

  let productName = productId;
  await db.runTransaction(async (tx) => {
    const ref = db.collection(COLLECTION).doc(productId);
    const doc = await tx.get(ref);
    if (!doc.exists) throw new Error("Produto não encontrado.");

    productName = doc.data()?.name ?? productId;
    const sizes: Array<{ size: string; quantity: number }> = doc.data()?.sizes ?? [];
    const colors: ColorStock[] = doc.data()?.colors ?? [];

    // Update aggregate sizes
    const updatedSizes = sizes.map((s) =>
      s.size === size ? { ...s, quantity: s.quantity + quantity } : s
    );
    if (!sizes.find((s) => s.size === size)) updatedSizes.push({ size, quantity });

    // Update per-color sizes if color specified
    let updatedColors = colors;
    if (color) {
      updatedColors = colors.map((c) => {
        if (c.name !== color) return c;
        const cs: Array<{ size: string; quantity: number }> = c.sizes ?? [];
        const updatedCs = cs.map((s) => s.size === size ? { ...s, quantity: s.quantity + quantity } : s);
        if (!cs.find((s) => s.size === size)) updatedCs.push({ size, quantity });
        return { ...c, sizes: updatedCs };
      });
    }

    tx.update(ref, { sizes: updatedSizes, colors: updatedColors, updatedAt: now });
  });

  const movement: Record<string, unknown> = {
    productId,
    productName,
    size,
    delta: quantity,
    type: "reposicao",
    date: spDate(now),
    createdAt: now,
  };
  if (color) movement.color = color;
  if (notes?.trim()) movement.notes = notes.trim();
  await db.collection("stockMovements").add(movement);
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ deleted: true, deletedAt: Date.now(), updatedAt: Date.now() });
}

export async function adminRestoreProduct(id: string): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ deleted: false, deletedAt: null, updatedAt: Date.now() });
}

export async function adminSetProductStatus(
  id: string,
  status: ProductStatus
): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ status, updatedAt: Date.now() });
}

export async function adminIsSlugTaken(
  slug: string,
  exceptId?: string
): Promise<boolean> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .get();
  if (snap.empty) return false;
  if (!exceptId) return true;
  return snap.docs.some((d) => d.id !== exceptId);
}

export async function writeAudit(entry: {
  actorUid: string;
  actorEmail: string | null;
  action: string;
  entity: "product" | "drop";
  entityId: string;
  summary?: string;
}) {
  const db = adminDb();
  await db.collection("auditLogs").add({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
  });

  const cutoff = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const stale = await db
    .collection("auditLogs")
    .where("createdAt", "<", cutoff)
    .limit(500)
    .get();

  if (!stale.empty) {
    const batch = db.batch();
    stale.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}
