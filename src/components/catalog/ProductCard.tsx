import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { stockLevel, type Product } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface Props {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority }: Props) {
  const level = stockLevel(product);
  const soldOut = level === "sold-out";
  const lowStock = level === "low";

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
          className={`object-contain p-6 transition-all duration-700 group-hover:scale-[1.06] ${
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

        {!soldOut && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-nyx-ink/90 text-nyx-bg flex items-center justify-center gap-2 py-3 label-mono text-xs">
            <span>Ver peça</span>
            <ArrowRight size={12} />
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-nyx-ink leading-tight">{product.name}</p>
          <p className="text-sm text-nyx-muted whitespace-nowrap">
            {formatPrice(product.price)}
          </p>
        </div>
        {lowStock && (
          <p className="label-mono text-[10px] text-amber-700">Últimas unidades</p>
        )}
        {product.colors && product.colors.length > 0 && (
          <p className="label-mono text-[10px] text-nyx-muted">
            {product.colors.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
