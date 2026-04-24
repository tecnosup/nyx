import type { Metadata } from "next";
import { listProducts, listCategories } from "@/lib/products";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todos os produtos NYX disponíveis no drop atual. Edições limitadas, peças numeradas, estoque controlado.",
};

export default async function ProdutosPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);

  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx">
        <header className="mb-12 md:mb-16">
          <p className="label-mono text-nyx-muted mb-4">Catálogo</p>
          <h1 className="heading-display text-5xl md:text-7xl text-nyx-ink">
            Tudo o que está <em className="italic font-normal">disponível</em>.
          </h1>
          <p className="mt-6 text-nyx-muted max-w-xl leading-relaxed">
            Estoque real, em tempo real. Quando acaba, sai do ar. Cada peça é
            numerada dentro do seu drop.
          </p>
        </header>

        <CategoryFilter active="all" categories={categories} className="mb-14" />

        <ProductGrid
          products={products}
          emptyMessage="Estamos preparando o próximo drop. Volte em breve."
        />
      </div>
    </div>
  );
}
