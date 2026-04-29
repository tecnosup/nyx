"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { Coupon } from "@/lib/admin-coupons";

interface Props {
  action: (prev: unknown, fd: FormData) => Promise<{ error?: Record<string, string[]> | string; ok?: boolean }>;
  defaultValues?: Coupon;
}

export function CouponForm({ action, defaultValues }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);

  const [type, setType] = useState<"percent" | "fixed">(defaultValues?.type ?? "percent");
  const [limitEnabled, setLimitEnabled] = useState(defaultValues?.usageLimit != null);
  const [expiresEnabled, setExpiresEnabled] = useState(defaultValues?.expiresAt != null);

  if (state?.ok) {
    router.push("/admin/cupons");
    return null;
  }

  const fieldError = (k: string) =>
    typeof state?.error === "object" ? state.error[k]?.[0] : undefined;

  const expiresDefault = defaultValues?.expiresAt
    ? new Date(defaultValues.expiresAt).toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="space-y-6">
      {typeof state?.error === "string" && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <Field label="Código do cupom" error={fieldError("code")}>
        <input
          name="code"
          type="text"
          required
          maxLength={30}
          placeholder="EX: PROMO20"
          defaultValue={defaultValues?.code}
          className="input-nyx uppercase"
        />
        <p className="text-xs text-nyx-muted mt-1">Apenas letras, números, - e _. Será convertido para maiúsculas.</p>
      </Field>

      <Field label="Tipo de desconto" error={fieldError("type")}>
        <div className="flex gap-4">
          {(["percent", "fixed"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => setType(t)}
                className="accent-nyx-ink"
              />
              <span className="text-sm">{t === "percent" ? "Percentual (%)" : "Valor fixo (R$)"}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field
        label={type === "percent" ? "Desconto (%)" : "Desconto (R$)"}
        error={fieldError("value")}
      >
        <input
          name="value"
          type="number"
          required
          min={type === "percent" ? 1 : 0.01}
          max={type === "percent" ? 100 : undefined}
          step={type === "percent" ? 1 : 0.01}
          defaultValue={defaultValues?.value}
          className="input-nyx"
          placeholder={type === "percent" ? "Ex: 15" : "Ex: 25.00"}
        />
      </Field>

      <div className="flex items-center gap-3">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked={defaultValues?.active ?? true}
          value="true"
          className="accent-nyx-ink w-4 h-4"
        />
        <label htmlFor="active" className="text-sm cursor-pointer">Cupom ativo</label>
      </div>

      <div className="space-y-3 border border-nyx-line p-4">
        <div className="flex items-center gap-3">
          <input
            id="limitEnabled"
            name="usageLimitEnabled"
            type="checkbox"
            checked={limitEnabled}
            onChange={(e) => setLimitEnabled(e.target.checked)}
            value="true"
            className="accent-nyx-ink w-4 h-4"
          />
          <label htmlFor="limitEnabled" className="text-sm cursor-pointer">Limitar número de usos</label>
        </div>
        {limitEnabled && (
          <Field label="Máximo de usos" error={fieldError("usageLimit")}>
            <input
              name="usageLimit"
              type="number"
              min={1}
              defaultValue={defaultValues?.usageLimit ?? 1}
              className="input-nyx"
            />
            {defaultValues?.usageCount != null && (
              <p className="text-xs text-nyx-muted mt-1">Utilizado {defaultValues.usageCount} vez(es)</p>
            )}
          </Field>
        )}
      </div>

      <div className="space-y-3 border border-nyx-line p-4">
        <div className="flex items-center gap-3">
          <input
            id="expiresEnabled"
            name="expiresAtEnabled"
            type="checkbox"
            checked={expiresEnabled}
            onChange={(e) => setExpiresEnabled(e.target.checked)}
            value="true"
            className="accent-nyx-ink w-4 h-4"
          />
          <label htmlFor="expiresEnabled" className="text-sm cursor-pointer">Definir data de expiração</label>
        </div>
        {expiresEnabled && (
          <Field label="Válido até" error={fieldError("expiresAt")}>
            <input
              name="expiresAt"
              type="date"
              defaultValue={expiresDefault}
              className="input-nyx"
            />
          </Field>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cta-pill px-6 py-2 text-xs disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar cupom"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/cupons")}
          className="px-6 py-2 text-xs border border-nyx-line hover:border-nyx-ink transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-nyx-muted">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-700">{error}</span>}
    </label>
  );
}
