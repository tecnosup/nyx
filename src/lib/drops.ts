import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { MOCK_DROPS } from "./mock-products";
import type { Drop } from "./types";

const DROPS_COLLECTION = "drops";

async function fetchDropsFromFirestore(): Promise<Drop[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, DROPS_COLLECTION), orderBy("releaseDate", "desc"))
  );
  return snapshot.docs
    .filter((doc) => !doc.data().deleted)
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Drop);
}

export async function listDrops(): Promise<Drop[]> {
  if (isFirebaseConfigured) {
    return fetchDropsFromFirestore();
  }
  return [...MOCK_DROPS].sort((a, b) => b.releaseDate - a.releaseDate);
}

export async function getDropBySlug(slug: string): Promise<Drop | null> {
  const all = await listDrops();
  return all.find((d) => d.slug === slug) ?? null;
}

export async function getActiveDrop(): Promise<Drop | null> {
  const all = await listDrops();
  return all.find((d) => d.status === "active") ?? null;
}

export async function getUpcomingDrop(): Promise<Drop | null> {
  const all = await listDrops();
  const upcoming = all.filter((d) => d.status === "upcoming");
  return upcoming.sort((a, b) => a.releaseDate - b.releaseDate)[0] ?? null;
}
