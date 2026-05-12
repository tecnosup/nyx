"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronLeft, X, CheckCircle, ArrowRight, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { CartCheckoutForm } from "@/components/checkout/CartCheckoutForm";
import { formatPrice } from "@/lib/utils";

export default function CarrinhoPage() {
  const { items, count, subtotalPix, subtotalCard, removeItem, clearCart } = useCart();
  const [ordered, setOrdered] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [orderedItems, setOrderedItems] = useState(items);
  const [orderedSubtotalPix, setOrderedSubtotalPix] = useState(subtotalPix);
  const [orderedSubtotalCard, setOrderedSubtotalCard] = useState(subtotalCard);

  function handleSuccess(url: string) {
    setOrderedItems(items);
    setOrderedSubtotalPix(subtotalPix);
    setOrderedSubtotalCard(subtotalCard);
    setWhatsappUrl(url);
    setOrdered(true);
    clearCart();
  }

  if (ordered) {
    return (
      <div className="pt-32 pb-24">
        <div className="container-nyx">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center text-center space-y-4 py-6">
                <CheckCircle size={48} className="text-green-600" strokeWidth={1.5} />
                <div>
                  <h2 className="heading-display text-2xl text-nyx-ink">Pedido enviado!</h2>
                  <p className="text-nyx-muted mt-2 max-w-sm">
                    Uma janela do WhatsApp foi aberta com seu pedido já formatado. Se não abriu automaticamente, clique no botão abaixo.
                  </p>
                </div>
              </div>

              <div className="border border-nyx-line bg-nyx-cream/40 p-5 space-y-2 text-sm text-nyx-muted">
                <p className="font-medium text-nyx-ink">O que acontece agora?</p>
                <ul className="space-y-1.5 list-none">
                  <li>① A Giovanna recebe seu pedido pelo WhatsApp</li>
                  <li>② Ela confirma disponibilidade, frete e prazo</li>
                  <li>③ Você realiza o pagamento e combinam a entrega</li>
                </ul>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center"
              >
                <MessageCircle size={18} />
                Abrir WhatsApp novamente
              </a>

              <Link href="/produtos" className="flex items-center justify-center gap-1 label-mono text-xs text-nyx-muted hover:text-nyx-ink transition-colors">
                Continuar comprando
                <ArrowRight size={13} />
              </Link>
            </div>

            <aside className="lg:sticky lg:top-28 h-fit">
              <div className="border border-nyx-line bg-nyx-cream/40 p-6 space-y-5">
                <p className="label-mono text-nyx-muted">Resumo</p>
                <div className="space-y-4">
                  {orderedItems.map((item) => (
                    <div key={`${item.productSlug}-${item.size}-${item.color}`} className="flex gap-3">
                      <div className="relative w-14 shrink-0 bg-nyx-cream" style={{ height: "4.5rem" }}>
                        {item.productImage && (
                          <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug truncate">{item.productName}</p>
                        <p className="text-xs text-nyx-muted">
                          Tam. {item.size}{item.color ? ` · ${item.color}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-nyx-line space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-nyx-muted">Pix</span>
                    <span>{formatPrice(orderedSubtotalPix)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nyx-muted">Cartão</span>
                    <span>{formatPrice(orderedSubtotalCard)}</span>
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
            <CartCheckoutForm items={items} onSuccess={handleSuccess} />
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
