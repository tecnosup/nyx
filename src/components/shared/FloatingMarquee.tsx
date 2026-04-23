"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  products: Product[];
  direction?: "left" | "right";
  speed?: number;
  label?: string;
}

export function FloatingMarquee({
  products,
  direction = "left",
  speed = 40,
  label,
}: Props) {
  if (products.length === 0) return null;

  const loop = [...products, ...products, ...products];
  const distance = direction === "left" ? "-33.333%" : "33.333%";

  return (
    <section className="relative py-14 md:py-20 overflow-hidden border-y border-nyx-line bg-nyx-cream/30">
      {label && (
        <div className="container-nyx mb-8">
          <p className="label-mono text-nyx-muted">{label}</p>
        </div>
      )}

      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <motion.div
          className="flex gap-6 md:gap-10 w-max"
          animate={{ x: ["0%", distance] }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {loop.map((product, i) => (
            <Link
              key={`${product.id}-${i}`}
              href={`/produtos/${product.slug}`}
              className="group shrink-0 w-[220px] md:w-[280px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-nyx-cream">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <p className="font-serif text-base md:text-lg text-nyx-ink leading-tight truncate">
                  {product.name}
                </p>
                <p className="font-serif text-sm md:text-base text-nyx-muted whitespace-nowrap">
                  {formatPrice(product.pricePix)}
                </p>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
