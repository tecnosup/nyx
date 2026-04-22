"use client";

import { SIZE_ORDER, type ProductSize, type SizeStock } from "@/lib/types";

interface Props {
  value: SizeStock[];
  onChange: (sizes: SizeStock[]) => void;
}

export function SizeStockEditor({ value, onChange }: Props) {
  function getQty(size: ProductSize): number {
    return value.find((s) => s.size === size)?.quantity ?? 0;
  }

  function isEnabled(size: ProductSize): boolean {
    return value.some((s) => s.size === size);
  }

  function toggle(size: ProductSize) {
    if (isEnabled(size)) {
      onChange(value.filter((s) => s.size !== size));
    } else {
      onChange([...value, { size, quantity: 0 }]);
    }
  }

  function setQty(size: ProductSize, qty: number) {
    const safe = Math.max(0, Math.round(qty) || 0);
    const next = value.map((s) => (s.size === size ? { ...s, quantity: safe } : s));
    onChange(next);
  }

  const total = value.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="label-mono text-nyx-muted">
          Tamanhos & estoque ({total} peças)
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SIZE_ORDER.map((size) => {
          const enabled = isEnabled(size);
          return (
            <div
              key={size}
              className={`border p-3 flex items-center gap-3 ${
                enabled ? "border-nyx-ink" : "border-nyx-line bg-nyx-cream/20"
              }`}
            >
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggle(size)}
                  className="accent-nyx-ink"
                />
                <span className="label-mono">{size}</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                disabled={!enabled}
                value={enabled ? getQty(size) : ""}
                onChange={(e) => setQty(size, Number(e.target.value))}
                className="w-16 border border-nyx-line px-2 py-1 text-right bg-transparent disabled:opacity-30"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
