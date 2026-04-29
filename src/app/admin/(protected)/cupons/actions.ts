"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "@/lib/admin-coupons";

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/^[A-Z0-9_-]+$/i, "Apenas letras, números, - e _"),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive("Deve ser maior que zero"),
  active: z.coerce.boolean(),
  usageLimitEnabled: z.coerce.boolean().optional(),
  usageLimit: z.coerce.number().int().nonnegative().nullable().optional(),
  expiresAtEnabled: z.coerce.boolean().optional(),
  expiresAt: z.string().optional().nullable(),
});

function parseFormData(fd: FormData) {
  const raw = Object.fromEntries(fd.entries());
  const parsed = couponSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors, data: null };

  const usageLimitEnabled = raw.usageLimitEnabled === "true" || raw.usageLimitEnabled === "on";
  const expiresAtEnabled = raw.expiresAtEnabled === "true" || raw.expiresAtEnabled === "on";

  const value = parsed.data.value;
  if (parsed.data.type === "percent" && (value <= 0 || value > 100)) {
    return { error: { value: ["Percentual deve ser entre 1 e 100"] }, data: null };
  }

  let usageLimit: number | null = null;
  if (usageLimitEnabled && parsed.data.usageLimit != null && parsed.data.usageLimit > 0) {
    usageLimit = parsed.data.usageLimit;
  }

  let expiresAt: number | null = null;
  if (expiresAtEnabled && parsed.data.expiresAt) {
    const d = new Date(parsed.data.expiresAt);
    if (!isNaN(d.getTime())) expiresAt = d.getTime();
  }

  return {
    error: null,
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      active: parsed.data.active,
      usageLimit,
      expiresAt,
    },
  };
}

export async function createCouponAction(
  _prev: unknown,
  fd: FormData
): Promise<{ error?: Record<string, string[]> | string; ok?: boolean }> {
  await requireAdmin();
  const { error, data } = parseFormData(fd);
  if (error || !data) return { error: error ?? "Erro ao processar formulário" };
  await adminCreateCoupon(data);
  revalidatePath("/admin/cupons");
  return { ok: true };
}

export async function updateCouponAction(
  id: string,
  _prev: unknown,
  fd: FormData
): Promise<{ error?: Record<string, string[]> | string; ok?: boolean }> {
  await requireAdmin();
  const { error, data } = parseFormData(fd);
  if (error || !data) return { error: error ?? "Erro ao processar formulário" };
  await adminUpdateCoupon(id, data);
  revalidatePath("/admin/cupons");
  revalidatePath(`/admin/cupons/${id}/editar`);
  return { ok: true };
}

export async function deleteCouponAction(id: string): Promise<void> {
  await requireAdmin();
  await adminDeleteCoupon(id);
  revalidatePath("/admin/cupons");
}

export async function toggleCouponActiveAction(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  await adminUpdateCoupon(id, { active });
  revalidatePath("/admin/cupons");
}
