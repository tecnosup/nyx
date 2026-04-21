import Link from "next/link";
import { CATEGORY_LABELS, type Product, type Drop } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { StockBadge } from "@/components/catalog/StockBadge";

interface Props {
  product: Product;
  drop?: Drop | null;
}

export function ProductInfo({ product, drop }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Link
            href={`/produtos/categoria/${product.category}`}
            className="label-mono text-nyx-muted hover:text-nyx-ink transition-colors"
          >
            {CATEGORY_LABELS[product.category]}
          </Link>
          <StockBadge product={product} />
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-nyx-ink leading-tight">
          {product.name}
        </h1>

        <p className="font-serif text-2xl text-nyx-ink mt-6">
          {formatPrice(product.price)}
        </p>
      </div>

      <div className="h-px bg-nyx-line" />

      <p className="text-nyx-muted leading-relaxed">{product.description}</p>

      {drop && (
        <div className="border-t border-nyx-line pt-6">
          <p className="label-mono text-nyx-muted mb-2">Drop</p>
          <Link
            href={`/drops/${drop.slug}`}
            className="font-serif text-xl text-nyx-ink link-underline"
          >
            {drop.name}
          </Link>
        </div>
      )}
    </div>
  );
}
