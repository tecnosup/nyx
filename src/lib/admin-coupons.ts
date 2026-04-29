import "server-only";
import { adminDb } from "./firebase-admin";

const COLLECTION = "coupons";

export type DiscountType = "percent" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  active: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCouponInput {
  code: string;
  type: DiscountType;
  value: number;
  active: boolean;
  usageLimit: number | null;
  expiresAt: number | null;
}

export async function adminListCoupons(): Promise<Coupon[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Coupon);
}

export async function adminGetCoupon(id: string): Promise<Coupon | null> {
  const d = await adminDb().collection(COLLECTION).doc(id).get();
  if (!d.exists) return null;
  return { id: d.id, ...d.data() } as Coupon;
}

export async function adminGetCouponByCode(code: string): Promise<Coupon | null> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("code", "==", code.toUpperCase().trim())
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Coupon;
}

export async function adminCreateCoupon(input: CreateCouponInput): Promise<string> {
  const now = Date.now();
  const ref = await adminDb()
    .collection(COLLECTION)
    .add({ ...input, code: input.code.toUpperCase().trim(), usageCount: 0, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function adminUpdateCoupon(
  id: string,
  input: Partial<CreateCouponInput>
): Promise<void> {
  const update: Record<string, unknown> = { ...input, updatedAt: Date.now() };
  if (input.code) update.code = input.code.toUpperCase().trim();
  await adminDb().collection(COLLECTION).doc(id).update(update);
}

export async function adminDeleteCoupon(id: string): Promise<void> {
  await adminDb().collection(COLLECTION).doc(id).delete();
}

export async function adminIncrementCouponUsage(id: string): Promise<void> {
  const ref = adminDb().collection(COLLECTION).doc(id);
  await ref.update({ usageCount: (await ref.get()).data()?.usageCount + 1, updatedAt: Date.now() });
}
