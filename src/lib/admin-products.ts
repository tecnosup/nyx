import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";
import { slugify } from "./slug";
import type {
  Product,
  ProductCategory,
  ProductStatus,
  SizeStock,
} from "./types";

const COLLECTION = "products";

export interface ProductInput {
  slug?: string;
  name: string;
  description: string;
  category: ProductCategory;
  pricePix: number;
  priceCard: number;
  colors: string[];
  images: string[];
  sizes: SizeStock[];
  dropId: string | null;
  isLimited: boolean;
  status: ProductStatus;
}

function sanitize(input: ProductInput): Omit<Product, "id" | "createdAt" | "updatedAt"> {
  return {
    slug: slugify(input.slug ?? input.name),
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category,
    pricePix: Math.round(input.pricePix * 100) / 100,
    priceCard: Math.round(input.priceCard * 100) / 100,
    colors: (input.colors ?? []).filter((c) => c.trim().length > 0),
    images: input.images.filter((url) => url.trim().length > 0),
    sizes: input.sizes
      .map((s) => ({ size: s.size, quantity: Math.max(0, Math.round(s.quantity)) }))
      .filter((s, idx, arr) => arr.findIndex((x) => x.size === s.size) === idx),
    dropId: input.dropId,
    isLimited: Boolean(input.isLimited),
    status: input.status,
  };
}

export async function adminListProducts(): Promise<Product[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("updatedAt", "desc")
    .get();
  return snap.docs
    .filter((doc) => !doc.data().deleted)
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
}

export async function adminListDeletedProducts(): Promise<Product[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("updatedAt", "desc")
    .get();
  return snap.docs
    .filter((doc) => doc.data().deleted === true)
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Product;
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
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ ...data, updatedAt: Date.now() });
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
