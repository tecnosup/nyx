import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import {
  getProductBySlug,
  listProducts,
  listRelatedProducts,
} from "@/lib/products";
import { listDrops } from "@/lib/drops";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { WhatsAppCta } from "@/components/product/WhatsAppCta";
import { DeliveryInfo } from "@/components/product/DeliveryInfo";
import { JsonLd } from "@/components/shared/JsonLd";
import { formatPrice } from "@/lib/utils";
import { productJsonLd, siteUrl } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  const description = product.description.slice(0, 160);
  const canonical = `/produtos/${product.slug}`;
  const image = product.images[0];
  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: siteUrl(canonical),
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, allDrops] = await Promise.all([
    listRelatedProducts(product, 2),
    listDrops(),
  ]);
  const drop = product.dropId
    ? allDrops.find((d) => d.id === product.dropId) ?? null
    : null;

  return (
    <div className="pt-28 pb-20">
      <JsonLd data={productJsonLd(product)} id="product-jsonld" />
      <div className="container-nyx">
        <Link
          href="/produtos"
          className="label-mono text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1 mb-10 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Voltar</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-10 lg:gap-14">
          <aside className="order-2 lg:order-1">
            <ProductInfo product={product} drop={drop} />
          </aside>

          <div className="order-1 lg:order-2">
            <ProductGallery images={product.images} alt={product.name} />
          </div>

          <aside className="order-3">
            <div className="lg:sticky lg:top-28">
              <WhatsAppCta product={product} />
              <DeliveryInfo />
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-32 md:mt-44">
            <p className="font-serif italic text-nyx-muted text-xl md:text-2xl mb-16 lowercase">
              você pode gostar
            </p>

            <div className="grid grid-cols-12 gap-6">
              {related.map((p, i) => {
                const layout =
                  i === 0
                    ? "col-span-12 sm:col-span-5 sm:col-start-1"
                    : "col-span-12 sm:col-span-4 sm:col-start-7 sm:mt-24";
                return (
                  <Link
                    key={p.id}
                    href={`/produtos/${p.slug}`}
                    className={`group block ${layout}`}
                  >
                    <div className="relative aspect-[4/5] product-stage overflow-hidden">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-contain p-8 transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="mt-3 flex items-start justify-between">
                      <p className="text-sm text-nyx-ink">{p.name}</p>
                      <p className="text-sm text-nyx-muted">
                        {formatPrice(p.pricePix)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
