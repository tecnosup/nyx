"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
      <div className="order-1 md:order-2 flex md:flex-col gap-3 md:w-20">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square w-20 shrink-0 overflow-hidden bg-nyx-cream transition-opacity",
              i === active ? "opacity-100 ring-1 ring-nyx-ink" : "opacity-60 hover:opacity-100"
            )}
            aria-label={`Ver imagem ${i + 1}`}
            aria-current={i === active ? "true" : undefined}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <div className="order-2 md:order-1 relative aspect-[4/5] product-stage overflow-hidden">
        <Image
          src={current}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
          className="object-contain p-8 md:p-12"
        />
      </div>
    </div>
  );
}
