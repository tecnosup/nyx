"use client";

import { useState } from "react";
import { SIZE_ORDER, SIZE_LABELS, type ProductSize, type SizeStock, type ColorStock } from "@/lib/types";

/* ── Standalone size grid (used when product has no colors) ── */
interface StandaloneProps {
  value: SizeStock[];
  onChange: (sizes: SizeStock[]) => void;
}

function StandaloneSizeGrid({ value, onChange }: StandaloneProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function getQty(size: ProductSize) { return value.find((s) => s.size === size)?.quantity ?? 0; }
  function isEnabled(size: ProductSize) { return value.some((s) => s.size === size); }

  function toggle(size: ProductSize) {
    if (isEnabled(size)) {
      onChange(value.filter((s) => s.size !== size));
      setDrafts((d) => { const c = { ...d }; delete c[size]; return c; });
    } else {
      onChange([...value, { size, quantity: 0 }]);
      setDrafts((d) => ({ ...d, [size]: "0" }));
    }
  }

  function handleChange(size: ProductSize, raw: string) {
    setDrafts((d) => ({ ...d, [size]: raw }));
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0) onChange(value.map((s) => s.size === size ? { ...s, quantity: n } : s));
  }

  function handleBlur(size: ProductSize) {
    setDrafts((d) => ({ ...d, [size]: String(getQty(size)) }));
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {SIZE_ORDER.map((size) => {
        const enabled = isEnabled(size);
        const displayVal = enabled ? (drafts[size] ?? String(getQty(size))) : "";
        return (
          <div key={size} className={`border p-3 flex items-center gap-2 overflow-hidden ${enabled ? "border-nyx-ink" : "border-nyx-line bg-nyx-cream/20"}`}>
            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
              <input type="checkbox" checked={enabled} onChange={() => toggle(size)} className="accent-nyx-ink shrink-0" />
              <div className="min-w-0">
                <p className="label-mono text-xs leading-tight">{size === "UNICO" ? "Único" : (SIZE_LABELS[size as keyof typeof SIZE_LABELS] ?? size)}</p>
                {size === "UNICO" && <p className="label-mono text-[8px] text-nyx-soft leading-tight">36-42</p>}
              </div>
            </label>
            <input
              type="number" min={0} step={1} disabled={!enabled}
              value={displayVal}
              onChange={(e) => handleChange(size, e.target.value)}
              onFocus={(e) => { if (e.target.value === "0") setDrafts((d) => ({ ...d, [size]: "" })); }}
              onBlur={() => handleBlur(size)}
              className="w-12 shrink-0 border border-nyx-line px-2 py-1 text-right bg-transparent disabled:opacity-30 focus:outline-none focus:border-nyx-muted"
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── Per-color size grid ── */
interface ColorSizeGridProps {
  color: ColorStock;
  onChange: (updated: ColorStock) => void;
  onToggleSoldOut: () => void;
  onRemove: () => void;
}

function ColorSizeGrid({ color, onChange, onToggleSoldOut, onRemove }: ColorSizeGridProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const sizes = color.sizes ?? [];
  function getQty(size: ProductSize) { return sizes.find((s) => s.size === size)?.quantity ?? 0; }
  function isEnabled(size: ProductSize) { return sizes.some((s) => s.size === size); }

  function toggle(size: ProductSize) {
    if (isEnabled(size)) {
      onChange({ ...color, sizes: sizes.filter((s) => s.size !== size) });
      setDrafts((d) => { const c = { ...d }; delete c[size]; return c; });
    } else {
      onChange({ ...color, sizes: [...sizes, { size, quantity: 0 }] });
      setDrafts((d) => ({ ...d, [size]: "0" }));
    }
  }

  function handleChange(size: ProductSize, raw: string) {
    setDrafts((d) => ({ ...d, [size]: raw }));
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0) {
      onChange({ ...color, sizes: sizes.map((s) => s.size === size ? { ...s, quantity: n } : s) });
    }
  }

  function handleBlur(size: ProductSize) {
    setDrafts((d) => ({ ...d, [size]: String(getQty(size)) }));
  }

  const total = sizes.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className={`border p-4 space-y-3 ${color.soldOut ? "border-red-300/50 bg-red-50/5" : "border-nyx-line"}`}>
      {/* Color header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`label-mono text-sm font-medium truncate ${color.soldOut ? "line-through text-nyx-muted" : "text-nyx-ink"}`}>
            {color.name}
          </span>
          {color.soldOut && <span className="label-mono text-[9px] text-red-600 border border-red-300 px-1">ESGOTADO</span>}
          <span className="label-mono text-[9px] text-nyx-soft">{total} peças</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSoldOut}
            className={`label-mono text-[10px] px-2 py-1 border transition-colors ${
              color.soldOut
                ? "border-green-400 text-green-700 hover:bg-green-50"
                : "border-amber-400 text-amber-700 hover:bg-amber-50"
            }`}
          >
            {color.soldOut ? "reativar" : "esgotar"}
          </button>
          <button type="button" onClick={onRemove} className="text-nyx-soft hover:text-red-500 transition-colors text-lg leading-none">×</button>
        </div>
      </div>

      {/* Size grid for this color */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {SIZE_ORDER.map((size) => {
          const enabled = isEnabled(size);
          const displayVal = enabled ? (drafts[size] ?? String(getQty(size))) : "";
          return (
            <div key={size} className={`border p-2 flex items-center gap-2 overflow-hidden ${enabled ? "border-nyx-ink" : "border-nyx-line bg-nyx-cream/20"}`}>
              <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
                <input type="checkbox" checked={enabled} onChange={() => toggle(size)} className="accent-nyx-ink shrink-0" />
                <div className="min-w-0">
                  <p className="label-mono text-[11px] leading-tight">{size === "UNICO" ? "Único" : (SIZE_LABELS[size as keyof typeof SIZE_LABELS] ?? size)}</p>
                  {size === "UNICO" && <p className="label-mono text-[8px] text-nyx-soft leading-tight">36-42</p>}
                </div>
              </label>
              <input
                type="number" min={0} step={1} disabled={!enabled}
                value={displayVal}
                onChange={(e) => handleChange(size, e.target.value)}
                onFocus={(e) => { if (e.target.value === "0") setDrafts((d) => ({ ...d, [size]: "" })); }}
                onBlur={() => handleBlur(size)}
                className="w-10 shrink-0 border border-nyx-line px-1.5 py-1 text-right text-xs bg-transparent disabled:opacity-30 focus:outline-none focus:border-nyx-muted"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ── */
interface Props {
  colors: ColorStock[];
  onChangeColors: (c: ColorStock[]) => void;
  standaloneSizes: SizeStock[];
  onChangeStandalone: (s: SizeStock[]) => void;
}

export function SizeStockEditor({ colors, onChangeColors, standaloneSizes, onChangeStandalone }: Props) {
  const hasColors = colors.length > 0;

  const totalAll = hasColors
    ? colors.reduce((sum, c) => sum + (c.sizes ?? []).reduce((s2, s) => s2 + s.quantity, 0), 0)
    : standaloneSizes.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div>
      <p className="label-mono text-nyx-muted mb-3">
        Tamanhos & estoque ({totalAll} peças)
        {hasColors && <span className="text-nyx-soft ml-1">— por cor</span>}
      </p>

      {hasColors ? (
        <div className="space-y-3">
          {colors.map((color, idx) => (
            <ColorSizeGrid
              key={color.name}
              color={color}
              onChange={(updated) => onChangeColors(colors.map((c, i) => i === idx ? updated : c))}
              onToggleSoldOut={() =>
                onChangeColors(colors.map((c, i) => i === idx ? { ...c, soldOut: !c.soldOut } : c))
              }
              onRemove={() => onChangeColors(colors.filter((_, i) => i !== idx))}
            />
          ))}
        </div>
      ) : (
        <StandaloneSizeGrid value={standaloneSizes} onChange={onChangeStandalone} />
      )}
    </div>
  );
}
