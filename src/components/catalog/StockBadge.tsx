import { stockLevel, type Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  product: Pick<Product, "sizes" | "isLimited">;
  className?: string;
}

export function StockBadge({ product, className }: Props) {
  const level = stockLevel(product);

  if (level === "sold-out") {
    return (
      <span
        className={cn(
          "label-mono bg-nyx-ink text-nyx-bg px-3 py-1 inline-block",
          className
        )}
      >
        Esgotado
      </span>
    );
  }

  if (level === "low") {
    return (
      <span
        className={cn(
          "label-mono border border-nyx-ink text-nyx-ink px-3 py-1 inline-block",
          className
        )}
      >
        Últimas peças
      </span>
    );
  }

  if (product.isLimited) {
    return (
      <span
        className={cn(
          "label-mono text-nyx-muted px-3 py-1 inline-block border border-nyx-line",
          className
        )}
      >
        Edição limitada
      </span>
    );
  }

  return null;
}
