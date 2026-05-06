"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle, PackagePlus } from "lucide-react";
import { restockProductAction } from "@/app/admin/(protected)/produtos/actions";
import { SIZE_LABELS, SIZE_ORDER, type ColorStock } from "@/lib/types";

interface Props {
  product: {
    id: string;
    name: string;
    sizes: Array<{ size: string; quantity: number }>;
    colors: ColorStock[];
  };
  onClose: () => void;
}

export function RestockModal({ product, onClose }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const hasColors = product.colors.length > 0;
  const colorsHaveSizes = hasColors && product.colors.some((c) => (c.sizes ?? []).length > 0);

  // Color selection — only when colors have size breakdown
  const [color, setColor] = useState<string>(colorsHaveSizes ? product.colors[0].name : "");

  // Available sizes: if color selected and that color has sizes, use those; else global sizes
  const selectedColor = product.colors.find((c) => c.name === color);
  const availableSizes = colorsHaveSizes && selectedColor
    ? (selectedColor.sizes ?? [])
    : product.sizes;

  const firstSize = availableSizes[0]?.size ?? SIZE_ORDER[0];
  const [size, setSize] = useState(firstSize);
  const [quantityStr, setQuantityStr] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // When color changes, reset size to first available for that color
  function handleColorChange(newColor: string) {
    setColor(newColor);
    const nc = product.colors.find((c) => c.name === newColor);
    const ns = colorsHaveSizes && nc ? (nc.sizes ?? []) : product.sizes;
    setSize(ns[0]?.size ?? SIZE_ORDER[0]);
  }

  const currentQty = availableSizes.find((s) => s.size === size)?.quantity ?? 0;

  function save() {
    setError("");
    const quantity = parseInt(quantityStr, 10);
    if (!size) { setError("Selecione um tamanho."); return; }
    if (!Number.isFinite(quantity) || quantity < 1) { setError("Quantidade deve ser pelo menos 1."); return; }
    startTransition(async () => {
      const res = await restockProductAction({
        productId: product.id,
        size,
        quantity,
        notes: notes.trim() || undefined,
        color: color || undefined,
      });
      if (res.ok) {
        setSuccess(true);
        const savedScroll = window.scrollY;
        setTimeout(() => router.refresh(), 600);
        setTimeout(() => {
          onClose();
          requestAnimationFrame(() => window.scrollTo({ top: savedScroll, behavior: "instant" }));
        }, 1400);
      } else {
        setError((res as { ok: false; error: string }).error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-nyx-bg border border-nyx-line p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <PackagePlus size={15} className="text-nyx-muted" />
            <h2 className="heading-display text-lg">Repor estoque</h2>
          </div>
          <button onClick={onClose} className="text-nyx-muted hover:text-nyx-ink"><X size={16} /></button>
        </div>

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
            <p className="text-sm text-nyx-ink">Estoque atualizado!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-nyx-muted truncate">{product.name}</p>

            {/* Color selector — shown when colors have size breakdown */}
            {colorsHaveSizes && (
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Cor</label>
                <select className="input-nyx" value={color} onChange={(e) => handleColorChange(e.target.value)}>
                  {product.colors.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Size selector */}
            <div>
              <label className="label-mono text-[10px] text-nyx-muted block mb-1">Tamanho</label>
              {colorsHaveSizes ? (
                // Only show sizes defined for this color
                availableSizes.length > 0 ? (
                  <select className="input-nyx" value={size} onChange={(e) => setSize(e.target.value)}>
                    {availableSizes.map((s) => (
                      <option key={s.size} value={s.size}>
                        {SIZE_LABELS[s.size as keyof typeof SIZE_LABELS] ?? s.size} — estoque atual: {s.quantity}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="label-mono text-[10px] text-nyx-soft">Nenhum tamanho cadastrado para esta cor. Edite o produto para adicionar.</p>
                )
              ) : (
                // No color breakdown — show all standard sizes
                <select className="input-nyx" value={size} onChange={(e) => setSize(e.target.value)}>
                  {SIZE_ORDER.map((s) => {
                    const existing = product.sizes.find((ps) => ps.size === s);
                    return (
                      <option key={s} value={s}>
                        {SIZE_LABELS[s as keyof typeof SIZE_LABELS] ?? s}
                        {existing !== undefined ? ` — estoque atual: ${existing.quantity}` : " — novo tamanho"}
                      </option>
                    );
                  })}
                </select>
              )}
              {(!colorsHaveSizes || availableSizes.length > 0) && (
                <p className="label-mono text-[9px] text-nyx-soft mt-1">
                  Estoque atual deste tamanho: {currentQty}
                </p>
              )}
            </div>

            {(!colorsHaveSizes || availableSizes.length > 0) && (
              <>
                <div>
                  <label className="label-mono text-[10px] text-nyx-muted block mb-1">Quantidade a adicionar</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className="input-nyx"
                    value={quantityStr}
                    onChange={(e) => setQuantityStr(e.target.value)}
                    onBlur={() => {
                      const n = parseInt(quantityStr, 10);
                      setQuantityStr(String(Number.isFinite(n) && n >= 1 ? n : 1));
                    }}
                  />
                </div>

                <div>
                  <label className="label-mono text-[10px] text-nyx-muted block mb-1">Observações (opcional)</label>
                  <input
                    className="input-nyx"
                    placeholder="Ex: Lote de reposição maio/26"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={onClose} className="label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors">
                    Cancelar
                  </button>
                  <button type="button" disabled={pending} onClick={save} className="label-mono text-xs px-5 py-2 bg-nyx-ink text-nyx-bg hover:bg-nyx-muted transition-colors disabled:opacity-50">
                    {pending ? "Salvando…" : "Confirmar"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
