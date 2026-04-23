"use client";

import { useState } from "react";
import { useActionState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { setFeaturedProductAction } from "@/app/admin/(protected)/configuracoes/actions";
import { formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/types";

interface ProductSummary {
  id: string;
  name: string;
  images: string[];
  category: string;
  pricePix: number;
  priceCard: number;
}

interface Props {
  products: ProductSummary[];
  currentId: string | null;
}

export function FeaturedProductForm({ products, currentId }: Props) {
  const [selected, setSelected] = useState<string>(currentId ?? "");
  const [state, action, pending] = useActionState(setFeaturedProductAction, {});

  const selectedProduct = products.find((p) => p.id === selected) ?? null;

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="productId" value={selected} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <PickerCard selected={selected === ""} onClick={() => setSelected("")}>
          <div className="aspect-[4/5] bg-nyx-line/20 flex items-center justify-center mb-3">
            <span className="label-mono text-[10px] text-nyx-muted">AUTO</span>
          </div>
          <p className="text-xs text-nyx-ink">Automático</p>
          <p className="label-mono text-[10px] text-nyx-muted mt-0.5">Mais recente</p>
        </PickerCard>

        {products.map((p) => (
          <PickerCard key={p.id} selected={selected === p.id} onClick={() => setSelected(p.id)}>
            <div className="relative aspect-[4/5] bg-nyx-line/20 mb-3 overflow-hidden">
              {p.images[0] ? (
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="200px"
                  className="object-contain p-2"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="label-mono text-[10px] text-nyx-muted">Sem foto</span>
                </div>
              )}
            </div>
            <p className="text-xs text-nyx-ink leading-tight line-clamp-2">{p.name}</p>
            <p className="label-mono text-[10px] text-nyx-muted mt-0.5">
              {formatPrice(p.pricePix)}
            </p>
          </PickerCard>
        ))}
      </div>

      <HeroPreview product={selectedProduct} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary self-start">
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}

function PickerCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-3 border text-left transition-colors ${
        selected
          ? "border-nyx-ink bg-nyx-ink/5"
          : "border-nyx-line hover:border-nyx-soft"
      }`}
    >
      {selected && (
        <span className="absolute top-2 right-2 w-4 h-4 bg-nyx-ink flex items-center justify-center">
          <Check size={10} className="text-nyx-bg" />
        </span>
      )}
      {children}
    </button>
  );
}

function HeroPreview({ product }: { product: ProductSummary | null }) {
  return (
    <div className="border border-nyx-line">
      <div className="px-4 pt-3 pb-2 border-b border-nyx-line">
        <p className="label-mono text-[10px] text-nyx-muted">Preview — Hero da página inicial</p>
      </div>
      <div className="p-4">
        {product ? (
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-20 flex-shrink-0 bg-nyx-line/20 overflow-hidden">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-serif italic text-sm text-nyx-ink truncate">{product.name}</p>
              <p className="label-mono text-[10px] text-nyx-muted mt-1">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="label-mono text-[10px] text-nyx-ink">
                  Pix {formatPrice(product.pricePix)}
                </span>
                <span className="label-mono text-[10px] text-nyx-muted">·</span>
                <span className="label-mono text-[10px] text-nyx-ink">
                  Cartão {formatPrice(product.priceCard)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="label-mono text-[10px] text-nyx-muted text-center py-4">
            O produto publicado mais recente será exibido automaticamente
          </p>
        )}
      </div>
    </div>
  );
}
