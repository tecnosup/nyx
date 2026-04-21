"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import {
  availableSizes,
  stockLevel,
  type Product,
  type ProductSize,
} from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { SizeSelector } from "./SizeSelector";

interface Props {
  product: Product;
}

export function WhatsAppCta({ product }: Props) {
  const [size, setSize] = useState<ProductSize | null>(() => {
    const avail = availableSizes(product);
    return avail.length === 1 && avail[0].size === "UNICO" ? "UNICO" : null;
  });

  const level = stockLevel(product);
  const soldOut = level === "sold-out";

  return (
    <div className="space-y-6">
      <p className="font-serif text-3xl md:text-4xl text-nyx-ink">
        {formatPrice(product.price)}
      </p>

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
            <a href={SITE_CONFIG.instagram} className="link-underline">
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

          {size ? (
            <Link
              href={`/checkout?slug=${encodeURIComponent(product.slug)}&size=${encodeURIComponent(size)}`}
              className="cta-pill w-full rounded-none"
            >
              <span>Continuar para checkout</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="cta-pill w-full rounded-none opacity-60 cursor-not-allowed"
            >
              Selecione um tamanho
            </button>
          )}

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
