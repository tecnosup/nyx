"use client";

import { useState } from "react";
import { useActionState } from "react";
import Image from "next/image";
import { Check, Sparkles } from "lucide-react";
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
  const isDirty = selected !== (currentId ?? "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="productId" value={selected} />

      {/* Current selection card */}
      <div className={`border p-5 transition-colors ${isDirty ? "border-nyx-muted" : "border-nyx-line"}`}>
        <p className="label-mono text-[9px] text-nyx-muted mb-4 tracking-widest">
          {isDirty ? "NOVA SELEÇÃO" : "EM DESTAQUE AGORA"}
        </p>

        {selectedProduct ? (
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-20 shrink-0 bg-nyx-line/20 overflow-hidden">
              {selectedProduct.images[0] ? (
                <Image
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1.5"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="label-mono text-[9px] text-nyx-soft">Sem foto</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="heading-display text-lg text-nyx-ink leading-tight truncate">
                {selectedProduct.name}
              </p>
              <p className="label-mono text-[9px] text-nyx-muted mt-1">
                {CATEGORY_LABELS[selectedProduct.category] ?? selectedProduct.category}
              </p>
              <p className="text-sm text-nyx-ink mt-2">
                {formatPrice(selectedProduct.pricePix)}
                {selectedProduct.priceCard > 0 && (
                  <span className="text-nyx-muted text-xs ml-2">· {formatPrice(selectedProduct.priceCard)} cartão</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <div className="w-16 h-20 shrink-0 border border-nyx-line/50 flex items-center justify-center">
              <Sparkles size={16} className="text-nyx-muted" />
            </div>
            <div>
              <p className="heading-display text-lg text-nyx-ink">Automático</p>
              <p className="text-xs text-nyx-muted mt-1">
                O produto publicado mais recente aparece no hero da página inicial.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-nyx-line" />
        <p className="label-mono text-[9px] text-nyx-soft">selecione uma peça</p>
        <div className="flex-1 h-px bg-nyx-line" />
      </div>

      {/* Picker grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Auto option */}
        <PickerCard selected={selected === ""} onClick={() => setSelected("")}>
          <div className="aspect-[4/5] flex items-center justify-center mb-2">
            <Sparkles size={18} className={selected === "" ? "text-nyx-bg" : "text-nyx-muted"} />
          </div>
          <p className={`text-[11px] font-medium truncate ${selected === "" ? "text-nyx-bg" : "text-nyx-ink"}`}>
            Automático
          </p>
          <p className={`label-mono text-[9px] mt-0.5 ${selected === "" ? "text-nyx-bg/70" : "text-nyx-soft"}`}>
            Mais recente
          </p>
        </PickerCard>

        {products.map((p) => (
          <PickerCard key={p.id} selected={selected === p.id} onClick={() => setSelected(p.id)}>
            <div className="relative aspect-[4/5] mb-2 overflow-hidden">
              {p.images[0] ? (
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="140px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`label-mono text-[9px] ${selected === p.id ? "text-nyx-bg/60" : "text-nyx-soft"}`}>
                    Sem foto
                  </span>
                </div>
              )}
            </div>
            <p className={`text-[11px] font-medium leading-tight line-clamp-2 ${selected === p.id ? "text-nyx-bg" : "text-nyx-ink"}`}>
              {p.name}
            </p>
            <p className={`label-mono text-[9px] mt-0.5 ${selected === p.id ? "text-nyx-bg/70" : "text-nyx-muted"}`}>
              {formatPrice(p.pricePix)}
            </p>
          </PickerCard>
        ))}
      </div>

      {/* Error */}
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      {/* Save */}
      <button
        type="submit"
        disabled={pending || !isDirty}
        className={`w-full label-mono text-xs py-3 transition-colors ${
          isDirty && !pending
            ? "bg-nyx-ink text-nyx-bg hover:bg-nyx-muted"
            : "border border-nyx-line text-nyx-soft cursor-not-allowed"
        } disabled:opacity-50`}
      >
        {pending ? "Salvando…" : isDirty ? "Salvar alterações" : "Nenhuma alteração"}
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
      className={`relative p-2.5 border text-left transition-all duration-200 ${
        selected
          ? "border-nyx-ink bg-nyx-ink"
          : "border-nyx-line hover:border-nyx-muted"
      }`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-nyx-bg flex items-center justify-center">
          <Check size={9} className="text-nyx-ink" />
        </span>
      )}
      {children}
    </button>
  );
}
