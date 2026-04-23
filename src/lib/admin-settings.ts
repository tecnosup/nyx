import "server-only";
import { adminDb } from "./firebase-admin";

const SETTINGS_COLLECTION = "settings";
const HOME_DOC = "home";

export interface HomeSettings {
  featuredProductId: string | null;
}

export async function getHomeSettings(): Promise<HomeSettings> {
  const doc = await adminDb().collection(SETTINGS_COLLECTION).doc(HOME_DOC).get();
  if (!doc.exists) return { featuredProductId: null };
  const data = doc.data() ?? {};
  return { featuredProductId: data.featuredProductId ?? null };
}

export async function setFeaturedProduct(productId: string | null): Promise<void> {
  await adminDb()
    .collection(SETTINGS_COLLECTION)
    .doc(HOME_DOC)
    .set({ featuredProductId: productId ?? null }, { merge: true });
}
