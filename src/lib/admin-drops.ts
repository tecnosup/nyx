import "server-only";
import { adminDb } from "./firebase-admin";
import { slugify } from "./slug";
import type { Drop, DropStatus } from "./types";

const COLLECTION = "drops";

export interface DropInput {
  slug?: string;
  name: string;
  description: string;
  releaseDate: number;
  status: DropStatus;
  heroImage?: string;
}

function sanitize(input: DropInput): Omit<Drop, "id" | "createdAt" | "updatedAt"> {
  const base: Omit<Drop, "id" | "createdAt" | "updatedAt"> = {
    slug: slugify(input.slug ?? input.name),
    name: input.name.trim(),
    description: input.description.trim(),
    releaseDate: Math.round(input.releaseDate),
    status: input.status,
  };
  const hero = input.heroImage?.trim();
  if (hero) base.heroImage = hero;
  return base;
}

export async function adminListDrops(): Promise<Drop[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("releaseDate", "desc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Drop);
}

export async function adminGetDrop(id: string): Promise<Drop | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Drop;
}

export async function adminCreateDrop(input: DropInput): Promise<string> {
  const data = sanitize(input);
  const now = Date.now();
  if (data.status === "active") await clearOtherActives(null);
  const ref = await adminDb()
    .collection(COLLECTION)
    .add({ ...data, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function adminUpdateDrop(
  id: string,
  input: DropInput
): Promise<void> {
  const data = sanitize(input);
  if (data.status === "active") await clearOtherActives(id);
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ ...data, updatedAt: Date.now() });
}

export async function adminDeleteDrop(id: string): Promise<void> {
  await adminDb().collection(COLLECTION).doc(id).delete();
}

export async function adminDropSlugTaken(
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

async function clearOtherActives(exceptId: string | null): Promise<void> {
  const db = adminDb();
  const snap = await db
    .collection(COLLECTION)
    .where("status", "==", "active")
    .get();
  const now = Date.now();
  const batch = db.batch();
  let count = 0;
  for (const doc of snap.docs) {
    if (exceptId && doc.id === exceptId) continue;
    batch.update(doc.ref, { status: "archived", updatedAt: now });
    count++;
  }
  if (count > 0) await batch.commit();
}
