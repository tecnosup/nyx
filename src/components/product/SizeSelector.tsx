"use client";

import { SIZE_ORDER, SIZE_LABELS, type ProductSize, type SizeStock } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  sizes: SizeStock[];
  selected: ProductSize | null;
  onSelect: (size: ProductSize) => void;
  hideLabel?: boolean;
}

export function SizeSelector({ sizes, selected, onSelect, hideLabel }: Props) {
  const byOrder = [...sizes].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  );

  return (
    <div>
      {!hideLabel && (
        <div className="flex items-center justify-between mb-3">
          <p className="label-mono text-nyx-muted">Tamanho</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {byOrder.map((s) => {
          const disabled = s.quantity === 0;
          const isSelected = selected === s.size;
          return (
            <button
              key={s.size}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(s.size)}
              className={cn(
                "size-pill",
                disabled && "size-pill-disabled",
                !disabled && !isSelected && "hover:border-nyx-ink",
                isSelected && "size-pill-active"
              )}
              aria-pressed={isSelected}
              aria-label={
                disabled
                  ? `Tamanho ${SIZE_LABELS[s.size]} indisponível`
                  : `Tamanho ${SIZE_LABELS[s.size]}`
              }
            >
              <span>{SIZE_LABELS[s.size]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
