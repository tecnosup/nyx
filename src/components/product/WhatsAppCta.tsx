"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import {
  availableSizes,
  stockLevel,
  type Product,
  type ProductSize,
} from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { SizeSelector } from "./SizeSelector";
import { useCart } from "@/contexts/CartContext";

interface Props {
  product: Product;
}

export function WhatsAppCta({ product }: Props) {
  const { addItem } = useCart();
  const [size, setSize] = useState<ProductSize | null>(() => {
    const avail = availableSizes(product);
    return avail.length === 1 && avail[0].size === "UNICO" ? "UNICO" : null;
  });
  const [color, setColor] = useState<string | null>(
    product.colors?.length === 1 ? product.colors[0] : null
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  const level = stockLevel(product);
  const soldOut = level === "sold-out";
  const hasColors = product.colors && product.colors.length > 1;
  const canAdd = !!size && (!hasColors || !!color);

  function handleAddToCart() {
    if (!size) return;
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.images[0] ?? "",
      size,
      color: color ?? undefined,
      pricePix: product.pricePix,
      priceCard: product.priceCard,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Preços */}
      <div className="space-y-1">
        <p className="font-serif text-3xl md:text-4xl text-nyx-ink">
          {formatPrice(product.pricePix)}
          <span className="ml-2 text-base font-sans text-nyx-muted font-normal">no Pix</span>
        </p>
        <p className="text-sm text-nyx-muted">
          {formatPrice(product.priceCard)} no cartão
        </p>
      </div>

      {soldOut ? (
        <>
          <SizeSelector sizes={product.sizes} selected={null} onSelect={() => {}} />
          <button
            type="button"
            disabled
            className="cta-pill w-full rounded-none opacity-60 cursor-not-allowed"
          >
            Esgotado
          </button>
          <p className="text-xs text-nyx-muted leading-relaxed">
            Siga o{" "}
            <a href={SITE_CONFIG.instagram} className="link-underline" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>{" "}
            para saber do próximo drop.
          </p>
        </>
      ) : (
        <>
          <SizeSelector
            sizes={product.sizes}
            selected={size}
            onSelect={setSize}
          />

          {/* Seletor de cor */}
          {hasColors && (
            <div className="space-y-2">
              <p className="label-mono text-xs text-nyx-muted">Cor</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`label-mono text-xs px-3 py-2 border transition-colors ${
                      color === c
                        ? "border-nyx-ink bg-nyx-ink text-nyx-bg"
                        : "border-nyx-line hover:border-nyx-ink"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="space-y-2">
            {canAdd ? (
              <Link
                href={`/checkout?slug=${encodeURIComponent(product.slug)}&size=${encodeURIComponent(size!)}`}
                className="cta-pill w-full rounded-none flex items-center justify-center gap-2"
              >
                <span>Comprar agora</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="cta-pill w-full rounded-none opacity-60 cursor-not-allowed"
              >
                {!size ? "Selecione um tamanho" : "Selecione uma cor"}
              </button>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAdd}
              className={`w-full inline-flex items-center justify-center gap-2 border px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                addedFeedback
                  ? "border-nyx-ink bg-nyx-cream/60 text-nyx-ink"
                  : "border-nyx-line text-nyx-ink hover:border-nyx-ink"
              }`}
            >
              <ShoppingBag size={14} />
              <span>{addedFeedback ? "Adicionado!" : "Adicionar ao carrinho"}</span>
            </button>
          </div>

          <div className="pt-2 space-y-1.5 text-xs text-nyx-muted">
            <p>
              <Link href="#" className="link-underline">
                Guia de medidas
              </Link>{" "}
              →
            </p>
            <p>
              <Link href="#" className="link-underline">
                Instruções de cuidado
              </Link>{" "}
              →
            </p>
          </div>
        </>
      )}
    </div>
  );
}
