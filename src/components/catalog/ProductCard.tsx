import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { stockLevel, type Product } from "@/lib/types";

interface Props {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority }: Props) {
  const level = stockLevel(product);
  const soldOut = level === "sold-out";

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group block"
      aria-label={`Ver ${product.name}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden product-stage">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className={`object-contain p-6 transition-all duration-700 group-hover:scale-[1.04] ${
            soldOut ? "opacity-50" : ""
          }`}
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            aria-hidden
            className="object-contain p-6 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        {soldOut && (
          <div className="absolute inset-x-0 bottom-0 bg-nyx-ink/85 text-nyx-bg text-center py-1.5 label-mono">
            Esgotado
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <p className="text-sm text-nyx-ink leading-tight truncate">
          {product.name}
        </p>
        <p className="text-sm text-nyx-muted whitespace-nowrap">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
