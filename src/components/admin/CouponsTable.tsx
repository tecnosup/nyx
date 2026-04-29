"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Coupon } from "@/lib/admin-coupons";
import { deleteCouponAction, toggleCouponActiveAction } from "@/app/admin/(protected)/cupons/actions";

function formatExpiry(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("pt-BR");
}

function DiscountBadge({ coupon }: { coupon: Coupon }) {
  const label =
    coupon.type === "percent" ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`;
  return (
    <span className="label-mono text-xs px-2 py-0.5 border border-nyx-line">
      {label}
    </span>
  );
}

function ActiveToggle({ coupon }: { coupon: Coupon }) {
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      await toggleCouponActiveAction(coupon.id, !coupon.active);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        coupon.active ? "bg-nyx-ink" : "bg-nyx-line"
      }`}
      title={coupon.active ? "Desativar" : "Ativar"}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          coupon.active ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();

  function handleDelete() {
    if (!confirm("Excluir este cupom permanentemente?")) return;
    start(async () => {
      await deleteCouponAction(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "…" : "Excluir"}
    </button>
  );
}

export function CouponsTable({ coupons }: { coupons: Coupon[] }) {
  return (
    <div className="border border-nyx-line overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nyx-line bg-nyx-cream/40">
              <th className="text-left px-4 py-3 label-mono text-xs text-nyx-muted">Código</th>
              <th className="text-left px-4 py-3 label-mono text-xs text-nyx-muted">Desconto</th>
              <th className="text-left px-4 py-3 label-mono text-xs text-nyx-muted">Usos</th>
              <th className="text-left px-4 py-3 label-mono text-xs text-nyx-muted">Expira</th>
              <th className="text-left px-4 py-3 label-mono text-xs text-nyx-muted">Ativo</th>
              <th className="text-right px-4 py-3 label-mono text-xs text-nyx-muted">Ações</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr
                key={c.id}
                className={`border-b border-nyx-line last:border-0 transition-colors hover:bg-nyx-cream/20 ${
                  !c.active ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-3 font-mono font-semibold tracking-wider">{c.code}</td>
                <td className="px-4 py-3">
                  <DiscountBadge coupon={c} />
                </td>
                <td className="px-4 py-3 text-nyx-muted">
                  {c.usageCount}
                  {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3 text-nyx-muted">{formatExpiry(c.expiresAt)}</td>
                <td className="px-4 py-3">
                  <ActiveToggle coupon={c} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/cupons/${c.id}/editar`}
                      className="text-xs hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteButton id={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
