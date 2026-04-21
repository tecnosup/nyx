import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

interface Props {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "Nenhum produto disponível no momento.",
}: Props) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="label-mono text-nyx-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 3} />
      ))}
    </div>
  );
}
