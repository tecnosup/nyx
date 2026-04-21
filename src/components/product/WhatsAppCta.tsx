"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
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

function buildWhatsAppMessage(product: Product, size: ProductSize): string {
  const lines = [
    `Olá! Tenho interesse em uma peça da NYX:`,
    ``,
    `*${product.name}*`,
    `Tamanho: ${size}`,
    `Valor: ${formatPrice(product.price)}`,
    ``,
    `Link: ${SITE_CONFIG.url}/produtos/${product.slug}`,
    ``,
    `Pode me passar forma de pagamento e prazo de entrega?`,
  ];
  return lines.join("\n");
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

  const message = size ? buildWhatsAppMessage(product, size) : "";
  const href = size
    ? `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
    : undefined;

  return (
    <div className="space-y-6">
      <SizeSelector
        sizes={product.sizes}
        selected={size}
        onSelect={setSize}
      />

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full"
        >
          <MessageCircle size={18} />
          <span>Comprar pelo WhatsApp</span>
        </a>
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
        Pagamento e frete combinados diretamente pelo WhatsApp. Envios para
        todo o Brasil.
      </p>
    </div>
  );
}
