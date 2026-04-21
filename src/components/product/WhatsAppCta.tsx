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

  if (soldOut) {
    return (
      <div className="space-y-6">
        <SizeSelector sizes={product.sizes} selected={null} onSelect={() => {}} />
        <button
          type="button"
          disabled
          className="btn-primary w-full opacity-60 cursor-not-allowed"
        >
          Esgotado
        </button>
        <p className="text-sm text-nyx-muted">
          Siga o <a href={SITE_CONFIG.instagram} className="link-underline">Instagram</a> para
          saber do próximo drop.
        </p>
      </div>
    );
  }

  const href = size
    ? `/checkout?slug=${encodeURIComponent(product.slug)}&size=${encodeURIComponent(size)}`
    : null;

  return (
    <div className="space-y-6">
      <SizeSelector
        sizes={product.sizes}
        selected={size}
        onSelect={setSize}
      />

      {href ? (
        <Link href={href} className="btn-primary w-full">
          <span>Continuar para checkout</span>
          <ArrowRight size={18} />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="btn-primary w-full opacity-60 cursor-not-allowed"
        >
          Selecione um tamanho
        </button>
      )}

      <p className="text-xs text-nyx-muted leading-relaxed">
        Pedido finalizado pelo WhatsApp. Pagamento e frete combinados na conversa.
      </p>
    </div>
  );
}
