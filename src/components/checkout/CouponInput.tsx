"use client";

import { useState } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface AppliedCoupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
}

interface Props {
  onApply: (coupon: AppliedCoupon | null) => void;
  applied: AppliedCoupon | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  not_found: "Cupom não encontrado.",
  inactive: "Este cupom não está ativo.",
  expired: "Este cupom está expirado.",
  limit_reached: "Este cupom atingiu o limite de usos.",
  rate_limited: "Muitas tentativas. Aguarde um momento.",
};

export function CouponInput({ onApply, applied }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(ERROR_MESSAGES[data.error] ?? "Cupom inválido.");
        return;
      }
      onApply({ id: data.id, code: data.code, type: data.type, value: data.value });
      setCode("");
    } catch {
      setError("Erro ao verificar cupom. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    onApply(null);
    setError(null);
  }

  if (applied) {
    const label =
      applied.type === "percent"
        ? `${applied.value}% de desconto`
        : `${formatPrice(applied.value)} de desconto`;

    return (
      <div className="flex items-center justify-between border border-nyx-ink bg-nyx-cream/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-nyx-ink" />
          <span className="label-mono text-xs">{applied.code}</span>
          <span className="text-xs text-nyx-muted">— {label}</span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="text-nyx-muted hover:text-nyx-ink transition-colors"
          aria-label="Remover cupom"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
          placeholder="Código do cupom"
          maxLength={30}
          className="input-nyx flex-1 uppercase"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2 text-xs border border-nyx-ink bg-nyx-ink text-nyx-bg hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Aplicar"}
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function calcDiscount(coupon: AppliedCoupon, subtotal: number): number {
  if (coupon.type === "percent") {
    return Math.round((subtotal * coupon.value) / 100 * 100) / 100;
  }
  return Math.min(coupon.value, subtotal);
}
