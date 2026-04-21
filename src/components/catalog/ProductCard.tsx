"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
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

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 150, damping: 18 });
  const springY = useSpring(my, { stiffness: 150, damping: 18 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const glareX = useTransform(springX, [-0.5, 0.5], ["20%", "80%"]);
  const glareY = useTransform(springY, [-0.5, 0.5], ["20%", "80%"]);

  function handleMove(e: MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  }

  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group block"
      aria-label={`Ver ${product.name}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative aspect-[4/5] overflow-hidden bg-nyx-cream"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className={`object-cover transition-all duration-700 group-hover:scale-[1.08] ${
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

        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]) =>
                `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.35), transparent 55%)`
            ),
          }}
        />

        <div
          className="absolute top-4 left-4"
          style={{ transform: "translateZ(40px)" }}
        >
          <StockBadge product={product} />
        </div>
      </motion.div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-xl text-nyx-ink leading-tight truncate group-hover:italic transition-all duration-300">
            {product.name}
          </h3>
          <p className="label-mono text-nyx-soft mt-1">{product.category}</p>
        </div>
        <p className="font-serif text-lg text-nyx-ink whitespace-nowrap">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
