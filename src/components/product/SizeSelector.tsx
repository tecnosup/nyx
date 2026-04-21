"use client";

import { SIZE_ORDER, type ProductSize, type SizeStock } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  sizes: SizeStock[];
  selected: ProductSize | null;
  onSelect: (size: ProductSize) => void;
}

export function SizeSelector({ sizes, selected, onSelect }: Props) {
  const byOrder = [...sizes].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  );

  return (
    <div>
      <p className="label-mono text-nyx-muted mb-4">Tamanho</p>
      <div className="flex flex-wrap gap-2">
        {byOrder.map((s) => {
          const disabled = s.quantity === 0;
          const isLow = s.quantity > 0 && s.quantity <= 2;
          const isSelected = selected === s.size;
          return (
            <button
              key={s.size}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(s.size)}
              className={cn(
                "label-mono px-5 py-3 border transition-all",
                disabled &&
                  "border-nyx-line text-nyx-soft line-through cursor-not-allowed",
                !disabled &&
                  !isSelected &&
                  "border-nyx-line text-nyx-ink hover:border-nyx-ink",
                isSelected && "border-nyx-ink bg-nyx-ink text-nyx-bg"
              )}
              aria-pressed={isSelected}
              aria-label={
                disabled
                  ? `Tamanho ${s.size} indisponível`
                  : `Tamanho ${s.size}`
              }
            >
              <span>{s.size}</span>
              {isLow && !disabled && (
                <span className="ml-2 text-[10px] opacity-70">
                  {s.quantity} rest.
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
