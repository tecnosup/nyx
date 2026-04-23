"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronLeft, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartCheckoutForm } from "@/components/checkout/CartCheckoutForm";
import { formatPrice } from "@/lib/utils";

export default function CarrinhoPage() {
  const { items, count, subtotalPix, subtotalCard, removeItem, clearCart } = useCart();

  if (count === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-sm px-6">
          <ShoppingBag size={36} className="text-nyx-line mx-auto mb-6" />
          <p className="label-mono text-nyx-muted mb-2">Carrinho vazio</p>
          <h1 className="heading-display text-4xl mb-6">Nada aqui ainda.</h1>
          <Link href="/produtos" className="btn-primary">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx">
        <Link
          href="/produtos"
          className="label-mono text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1 mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Continuar comprando</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16">
          {/* Form */}
          <div>
            <h1 className="heading-display text-4xl md:text-5xl mb-2">Finalizar pedido</h1>
            <p className="text-nyx-muted mb-10 max-w-lg">
              Preencha seus dados. Ao confirmar, abrimos o WhatsApp com o pedido completo para a Giovanna.
            </p>
            <CartCheckoutForm items={items} onSuccess={clearCart} />
          </div>

          {/* Resumo */}
          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="border border-nyx-line bg-nyx-cream/40 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <p className="label-mono text-nyx-muted">
                  Resumo ({count} {count === 1 ? "peça" : "peças"})
                </p>
                <button
                  onClick={clearCart}
                  className="label-mono text-[10px] text-nyx-soft hover:text-red-700 transition-colors"
                >
                  Limpar
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productSlug}-${item.size}-${item.color}`}
                    className="flex gap-3"
                  >
                    <div className="relative w-14 shrink-0 bg-nyx-cream" style={{ height: "4.5rem" }}>
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate">{item.productName}</p>
                      <p className="text-xs text-nyx-muted">
                        Tam. {item.size}{item.color ? ` · ${item.color}` : ""}
                      </p>
                      <p className="text-sm mt-0.5">
                        {formatPrice(item.pricePix)}
                        <span className="text-nyx-muted text-xs ml-1">Pix</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productSlug, item.size, item.color)}
                      className="text-nyx-soft hover:text-nyx-ink transition-colors self-start"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-nyx-line space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-nyx-muted">Subtotal Pix</span>
                  <span>{formatPrice(subtotalPix)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nyx-muted">Subtotal Cartão</span>
                  <span>{formatPrice(subtotalCard)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nyx-muted">Frete</span>
                  <span className="text-nyx-muted">a combinar</span>
                </div>
              </div>

              <p className="text-xs text-nyx-muted leading-relaxed">
                Pagamento e frete confirmados na conversa com a Giovanna.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
