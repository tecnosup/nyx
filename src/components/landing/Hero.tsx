"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  featured?: Product | null;
  dropLabel?: string;
}

export function Hero({ featured, dropLabel = "Drop 01 — Disponível agora" }: Props) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 15 });

  const imgX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const imgY = useTransform(springY, [-0.5, 0.5], [-12, 12]);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  if (!featured) {
    return (
      <section className="relative min-h-[88vh] flex items-center pt-28 pb-16 product-stage-dim">
        <div className="container-nyx text-center">
          <p className="label-mono text-nyx-muted mb-8">{dropLabel}</p>
          <h1 className="heading-display text-[13vw] md:text-[8rem] text-nyx-ink">
            Próximo drop <em className="italic">em preparo</em>.
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 md:pb-28 product-stage-dim overflow-hidden">
      <div className="container-nyx relative w-full">
        <div className="relative flex flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="label-mono text-nyx-muted mb-8"
          >
            {dropLabel}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ x: imgX, y: imgY }}
            className="relative w-full max-w-[640px] aspect-[4/5] md:max-w-[420px]"
          >
            <div
              aria-hidden
              className="absolute inset-x-[8%] bottom-[-20px] h-10 rounded-[50%] bg-nyx-ink/25 blur-2xl"
            />
            <div
              className="relative w-full h-full"
              style={{ animation: "floaty 6s ease-in-out infinite" }}
            >
              <Image
                src={featured.images[0]}
                alt={featured.name}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                priority
                className="object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-col items-center gap-5"
          >
            <Link
              href={`/produtos/${featured.slug}`}
              className="cta-pill group"
            >
              <span>Ver peça</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <div className="flex items-baseline gap-3 text-nyx-ink">
              <span className="font-serif italic text-lg md:text-xl">
                {featured.name}
              </span>
              <span className="text-nyx-muted">·</span>
              <span className="text-sm text-nyx-muted">
                {formatPrice(featured.price)}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-nyx-muted"
      >
        <span className="label-mono">Rolar</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-nyx-ink/40"
        />
      </motion.div>
    </section>
  );
}
