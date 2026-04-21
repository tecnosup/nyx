"use client";

import { SIZE_ORDER, type ProductSize, type SizeStock } from "@/lib/types";
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
          {selected && (
            <p className="label-mono text-nyx-ink">{selected}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-4 gap-2">
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
                "size-pill relative",
                disabled && "size-pill-disabled",
                !disabled && !isSelected && "hover:border-nyx-ink",
                isSelected && "size-pill-active"
              )}
              aria-pressed={isSelected}
              aria-label={
                disabled
                  ? `Tamanho ${s.size} indisponível`
                  : `Tamanho ${s.size}`
              }
            >
              <span>{s.size}</span>
              {isLow && !disabled && !isSelected && (
                <span className="absolute -top-1.5 -right-1 bg-nyx-ink text-nyx-bg text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                  {s.quantity}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
