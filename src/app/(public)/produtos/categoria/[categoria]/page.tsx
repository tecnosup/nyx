import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CATEGORY_LABELS,
  type ProductCategory,
} from "@/lib/types";
import { listProductsByCategory } from "@/lib/products";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";
import { ProductGrid } from "@/components/catalog/ProductGrid";

interface PageProps {
  params: Promise<{ categoria: string }>;
}

const VALID: ProductCategory[] = [
  "camisetas",
  "moletons",
  "calcas",
  "jaquetas",
  "acessorios",
];

function toCategory(slug: string): ProductCategory | null {
  return (VALID as string[]).includes(slug) ? (slug as ProductCategory) : null;
}

export function generateStaticParams() {
  return VALID.map((c) => ({ categoria: c }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const cat = toCategory(categoria);
  if (!cat) return { title: "Categoria não encontrada" };
  return {
    title: CATEGORY_LABELS[cat],
    description: `${CATEGORY_LABELS[cat]} NYX — peças limitadas, edições numeradas, curadoria de drops.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoria } = await params;
  const cat = toCategory(categoria);
  if (!cat) notFound();

  const products = await listProductsByCategory(cat);

  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx">
        <header className="mb-12 md:mb-16">
          <p className="label-mono text-nyx-muted mb-4">Categoria</p>
          <h1 className="heading-display text-5xl md:text-7xl text-nyx-ink">
            {CATEGORY_LABELS[cat]}
          </h1>
        </header>

        <CategoryFilter active={cat} className="mb-14" />

        <ProductGrid
          products={products}
          emptyMessage="Nenhuma peça desta categoria no drop atual."
        />
      </div>
    </div>
  );
}
