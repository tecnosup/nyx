import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { stockLevel, type Product } from "@/lib/types";
import { StockBadge } from "./StockBadge";

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
      <div className="relative aspect-[4/5] overflow-hidden bg-nyx-cream">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${
            soldOut ? "opacity-60" : ""
          }`}
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            aria-hidden
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        <div className="absolute top-4 left-4">
          <StockBadge product={product} />
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-xl text-nyx-ink leading-tight truncate">
            {product.name}
          </h3>
          <p className="label-mono text-nyx-soft mt-1">
            {product.category}
          </p>
        </div>
        <p className="font-serif text-lg text-nyx-ink whitespace-nowrap">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
