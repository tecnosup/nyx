import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/products";
import { SIZE_ORDER, availableSizes, type ProductSize } from "@/lib/types";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize seu pedido NYX pelo WhatsApp.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ slug?: string; size?: string }>;
}

function isProductSize(v: string): v is ProductSize {
  return (SIZE_ORDER as string[]).includes(v);
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const { slug, size } = await searchParams;
  if (!slug || !size) redirect("/produtos");
  if (!isProductSize(size)) redirect("/produtos");

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const avail = availableSizes(product);
  const sizeOk = avail.some((s) => s.size === size);
  if (!sizeOk) {
    redirect(`/produtos/${product.slug}`);
  }

  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx">
        <Link
          href={`/produtos/${product.slug}`}
          className="label-mono text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1 mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Voltar à peça</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">
          <div>
            <h1 className="heading-display text-4xl md:text-5xl mb-2">
              Checkout
            </h1>
            <p className="text-nyx-muted mb-10 max-w-lg">
              Preencha seus dados. Ao confirmar, você será direcionado ao
              WhatsApp com o pedido já formatado para a Giovana.
            </p>

            <CheckoutForm
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
              }}
              size={size}
            />
          </div>

          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="border border-nyx-line bg-nyx-cream/40 p-6 space-y-5">
              <p className="label-mono text-nyx-muted">Resumo</p>

              <div className="flex gap-4">
                {product.images[0] && (
                  <div className="relative w-20 h-24 shrink-0 bg-nyx-cream">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{product.name}</p>
                  <p className="text-sm text-nyx-muted mt-1">Tamanho {size}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-nyx-line space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-nyx-muted">Peça</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nyx-muted">Frete</span>
                  <span className="text-nyx-muted">a combinar</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-nyx-line font-medium">
                  <span>Total</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
              </div>

              <p className="text-xs text-nyx-muted leading-relaxed">
                Pagamento e frete confirmados na conversa com a Giovana.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
