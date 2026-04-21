import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getProductBySlug,
  listProducts,
  listRelatedProducts,
} from "@/lib/products";
import { getDropBySlug, listDrops } from "@/lib/drops";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { WhatsAppCta } from "@/components/product/WhatsAppCta";
import { ProductGrid } from "@/components/catalog/ProductGrid";

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
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, allDrops] = await Promise.all([
    listRelatedProducts(product),
    listDrops(),
  ]);
  const drop = product.dropId
    ? allDrops.find((d) => d.id === product.dropId) ?? null
    : null;

  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx">
        <Link
          href="/produtos"
          className="label-mono text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1 mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Voltar ao catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <ProductGallery images={product.images} alt={product.name} />

          <div className="space-y-10">
            <ProductInfo product={product} drop={drop} />
            <WhatsAppCta product={product} />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-32 pt-16 border-t border-nyx-line">
            <h2 className="heading-display text-3xl md:text-4xl mb-12">
              Você também pode gostar
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  );
}
