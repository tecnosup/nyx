import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listProductsByCategory } from "@/lib/products";
import { adminListCategories } from "@/lib/admin-categories";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";
import { ProductGrid } from "@/components/catalog/ProductGrid";

interface PageProps {
  params: Promise<{ categoria: string }>;
}

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const categories = await adminListCategories();
  const cat = categories.find((c) => c.slug === categoria);
  if (!cat) return { title: "Categoria não encontrada" };
  return {
    title: cat.label,
    description: `${cat.label} NYX — peças limitadas, edições numeradas, curadoria de drops.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoria } = await params;
  const [categories, products] = await Promise.all([
    adminListCategories(),
    listProductsByCategory(categoria),
  ]);

  const cat = categories.find((c) => c.slug === categoria);
  if (!cat) notFound();

  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx">
        <header className="mb-12 md:mb-16">
          <p className="label-mono text-nyx-muted mb-4">Categoria</p>
          <h1 className="heading-display text-5xl md:text-7xl text-nyx-ink">
            {cat.label}
          </h1>
        </header>

        <CategoryFilter active={categoria} categories={categories} className="mb-14" />

        <ProductGrid
          products={products}
          emptyMessage="Nenhuma peça desta categoria no drop atual."
        />
      </div>
    </div>
  );
}
