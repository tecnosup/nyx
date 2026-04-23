import "server-only";
import { adminDb } from "./firebase-admin";
import { slugify } from "./slug";
import { PRODUCT_CATEGORIES } from "./constants";

const COLLECTION = "categories";

export interface CategoryDoc {
  id: string;
  slug: string;
  label: string;
  order: number;
  createdAt: number;
}

export interface CategoryInput {
  slug?: string;
  label: string;
  order?: number;
}

export async function adminListCategories(): Promise<CategoryDoc[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("order", "asc")
    .get();

  if (!snap.empty) {
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CategoryDoc);
  }

  // Firestore vazio — devolve os padrões hardcoded como fallback (sem persistir)
  return PRODUCT_CATEGORIES.map((c, i) => ({
    id: c.slug,
    slug: c.slug,
    label: c.label,
    order: i,
    createdAt: 0,
  }));
}

export async function adminCreateCategory(input: CategoryInput): Promise<string> {
  const slug = slugify(input.slug ?? input.label);
  const all = await adminListCategories();
  const maxOrder = all.reduce((m, c) => Math.max(m, c.order), -1);
  const ref = await adminDb().collection(COLLECTION).add({
    slug,
    label: input.label.trim(),
    order: input.order ?? maxOrder + 1,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function adminUpdateCategory(
  id: string,
  input: CategoryInput
): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({
      slug: slugify(input.slug ?? input.label),
      label: input.label.trim(),
      ...(input.order !== undefined ? { order: input.order } : {}),
    });
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await adminDb().collection(COLLECTION).doc(id).delete();
}

export async function adminCategorySlugTaken(
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

export async function seedDefaultCategories(): Promise<void> {
  const snap = await adminDb().collection(COLLECTION).limit(1).get();
  if (!snap.empty) return;
  const batch = adminDb().batch();
  PRODUCT_CATEGORIES.forEach((c, i) => {
    const ref = adminDb().collection(COLLECTION).doc();
    batch.set(ref, { slug: c.slug, label: c.label, order: i, createdAt: Date.now() });
  });
  await batch.commit();
}
