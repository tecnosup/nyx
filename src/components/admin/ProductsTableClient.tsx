"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS, totalStock, SIZE_LABELS } from "@/lib/types";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { RestockModal } from "@/components/admin/RestockModal";
import { deleteProductAction } from "@/app/admin/(protected)/produtos/actions";
import type { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  return (
    <span className={`label-mono text-[9px] border px-2 py-1 inline-block shrink-0 ${
      status === "published" ? "border-nyx-ink text-nyx-ink" : "border-nyx-line text-nyx-muted"
    }`}>
      {status === "published" ? "Publicado" : "Rascunho"}
    </span>
  );
}

const SCROLL_KEY = "nyx_admin_products_scroll";

function saveScroll() {
  sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
}

export function ProductsTableClient({ products }: Props) {
  const [restocking, setRestocking] = useState<Product | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      sessionStorage.removeItem(SCROLL_KEY);
      const y = parseInt(saved, 10);
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" }));
    }
  }, []);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border border-nyx-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nyx-line">
              <th className="text-left px-5 py-3 label-mono text-[9px] text-nyx-muted">Nome</th>
              <th className="text-left px-4 py-3 label-mono text-[9px] text-nyx-muted">Categoria</th>
              <th className="text-right px-4 py-3 label-mono text-[9px] text-nyx-muted">Pix</th>
              <th className="text-right px-4 py-3 label-mono text-[9px] text-nyx-muted">Cartão</th>
              <th className="text-right px-4 py-3 label-mono text-[9px] text-nyx-muted">Estoque</th>
              <th className="text-left px-4 py-3 label-mono text-[9px] text-nyx-muted">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-nyx-line">
            {products.map((p) => {
              const stock = totalStock(p);
              return (
                <tr key={p.id} className="hover:bg-nyx-cream/10 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/produtos/${p.id}/editar`} className="font-medium hover:underline text-nyx-ink">
                      {p.name}
                    </Link>
                    <p className="label-mono text-[9px] text-nyx-soft mt-0.5">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-nyx-muted text-xs">{CATEGORY_LABELS[p.category]}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatPrice(p.pricePix)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-nyx-muted">{formatPrice(p.priceCard)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      {stock === 0
                        ? <span className="label-mono text-[10px] text-red-600">Esgotado</span>
                        : <span className="font-mono text-xs text-nyx-ink">{stock}</span>}
                      <div className="flex gap-1 flex-wrap justify-end">
                        {p.sizes.filter(s => s.quantity > 0).map(s => (
                          <span key={s.size} className="label-mono text-[8px] text-nyx-soft">
                            {SIZE_LABELS[s.size as keyof typeof SIZE_LABELS] ?? s.size}:{s.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setRestocking(p)}
                        title="Repor estoque"
                        className="text-nyx-soft hover:text-emerald-500 transition-colors"
                      >
                        <PackagePlus size={14} />
                      </button>
                      <Link href={`/admin/produtos/${p.id}/editar`} onClick={saveScroll} className="label-mono text-xs text-nyx-muted hover:text-nyx-ink transition-colors">
                        Editar
                      </Link>
                      <DeleteButton
                        onDelete={deleteProductAction.bind(null, p.id)}
                        confirmMessage={`Excluir "${p.name}"? Esta ação não pode ser desfeita.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden border border-nyx-line divide-y divide-nyx-line">
        {products.map((p) => {
          const stock = totalStock(p);
          return (
            <div key={p.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-nyx-ink truncate">{p.name}</p>
                  <p className="label-mono text-[9px] text-nyx-soft mt-0.5">{CATEGORY_LABELS[p.category]}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Pix</p>
                  <p className="font-mono text-nyx-ink">{formatPrice(p.pricePix)}</p>
                </div>
                <div>
                  <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Cartão</p>
                  <p className="font-mono text-nyx-muted">{formatPrice(p.priceCard)}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Estoque</p>
                  {stock === 0
                    ? <p className="label-mono text-[10px] text-red-600">Esgotado</p>
                    : <p className="font-mono text-nyx-ink">{stock}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-nyx-line/40">
                <button
                  type="button"
                  onClick={() => setRestocking(p)}
                  className="inline-flex items-center gap-1.5 label-mono text-[10px] px-3 py-2 border border-emerald-400/50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors"
                >
                  <PackagePlus size={12} />
                  Repor
                </button>
                <Link
                  href={`/admin/produtos/${p.id}/editar`}
                  className="flex-1 text-center label-mono text-[10px] px-3 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink hover:border-nyx-muted transition-colors"
                >
                  Editar
                </Link>
                <DeleteButton
                  onDelete={deleteProductAction.bind(null, p.id)}
                  confirmMessage={`Excluir "${p.name}"? Esta ação não pode ser desfeita.`}
                  variant="button"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock modal */}
      {restocking && (
        <RestockModal
          product={{
            id: restocking.id,
            name: restocking.name,
            sizes: restocking.sizes,
            colors: restocking.colors,
          }}
          onClose={() => setRestocking(null)}
        />
      )}
    </>
  );
}
