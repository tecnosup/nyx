"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, count, subtotalPix, isOpen, closeCart, removeItem } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-nyx-ink/20 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        aria-label="Carrinho"
        className={`fixed top-0 right-0 z-[80] h-full w-full max-w-md bg-nyx-bg border-l border-nyx-line flex flex-col transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-nyx-line">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-nyx-ink" />
            <span className="label-mono text-nyx-ink">
              Carrinho {count > 0 && `(${count})`}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="text-nyx-muted hover:text-nyx-ink transition-colors"
            aria-label="Fechar carrinho"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-16">
              <ShoppingBag size={32} className="text-nyx-line" />
              <p className="text-nyx-muted text-sm">Seu carrinho está vazio.</p>
              <Link href="/produtos" onClick={closeCart} className="label-mono text-xs text-nyx-ink underline underline-offset-4">
                Ver catálogo →
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productSlug}-${item.size}-${item.color}`} className="flex gap-4">
                <div className="relative w-16 h-20 shrink-0 bg-nyx-cream">
                  {item.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-nyx-muted mt-0.5">
                    Tamanho {item.size}
                    {item.color && ` · ${item.color}`}
                  </p>
                  <p className="text-sm mt-1">
                    {formatPrice(item.pricePix)}
                    <span className="text-nyx-muted text-xs ml-1">Pix</span>
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.productSlug, item.size, item.color)}
                  className="text-nyx-soft hover:text-nyx-ink transition-colors self-start pt-0.5"
                  aria-label="Remover item"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {count > 0 && (
          <div className="px-6 py-5 border-t border-nyx-line space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-nyx-muted">Subtotal Pix ({count} {count === 1 ? "peça" : "peças"})</span>
              <span className="font-medium">{formatPrice(subtotalPix)}</span>
            </div>
            <p className="text-xs text-nyx-muted">Frete e forma de pagamento confirmados no WhatsApp.</p>
            <Link
              href="/carrinho"
              onClick={closeCart}
              className="btn-primary w-full text-center"
            >
              Finalizar pedido
            </Link>
            <button
              onClick={closeCart}
              className="w-full label-mono text-xs text-nyx-muted hover:text-nyx-ink transition-colors py-1"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
