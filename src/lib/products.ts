import {
  collection,
  getDocs,
  limit,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { MOCK_PRODUCTS } from "./mock-products";
import type { Product, ProductCategory } from "./types";

const PRODUCTS_COLLECTION = "products";
const MAX_CATALOG_SIZE = 25;

function sortByNewest(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.updatedAt - a.updatedAt);
}

async function fetchPublishedFromFirestore(): Promise<Product[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(
      collection(db, PRODUCTS_COLLECTION),
      where("status", "==", "published"),
      orderBy("updatedAt", "desc"),
      limit(MAX_CATALOG_SIZE)
    )
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
}

export async function listProducts(): Promise<Product[]> {
  if (isFirebaseConfigured) {
    return fetchPublishedFromFirestore();
  }
  return sortByNewest(MOCK_PRODUCTS.filter((p) => p.status === "published")).slice(
    0,
    MAX_CATALOG_SIZE
  );
}

export async function listProductsByCategory(
  category: ProductCategory
): Promise<Product[]> {
  const all = await listProducts();
  return all.filter((p) => p.category === category);
}

export async function listProductsByDrop(dropId: string): Promise<Product[]> {
  const all = await listProducts();
  return all.filter((p) => p.dropId === dropId);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await listProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function listRelatedProducts(
  product: Product,
  max = 4
): Promise<Product[]> {
  const all = await listProducts();
  return all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, max);
}
