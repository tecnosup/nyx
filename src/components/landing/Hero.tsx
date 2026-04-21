"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

export function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 40, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 15 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const translateZ = useTransform(springX, [-0.5, 0.5], [0, 30]);

  const bgX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const bgY = useTransform(springY, [-0.5, 0.5], [-20, 20]);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <section
      className="relative min-h-[92vh] flex items-center pt-24 pb-12 overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ x: bgX, y: bgY }}
      >
        <div
          className="w-full h-full scale-125"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #545454 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute top-1/4 -left-10 w-[420px] h-[420px] rounded-full bg-nyx-cream blur-3xl opacity-40 pointer-events-none"
        style={{ x: useTransform(springX, [-0.5, 0.5], [40, -40]), y: bgY }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-10 right-0 w-[360px] h-[360px] rounded-full bg-nyx-stone/30 blur-3xl pointer-events-none"
        style={{ x: useTransform(springX, [-0.5, 0.5], [-30, 30]), y: useTransform(springY, [-0.5, 0.5], [30, -30]) }}
      />

      <div className="container-nyx relative" style={{ transformStyle: "preserve-3d" }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="label-mono text-nyx-muted mb-6"
        >
          Drop 01 — Disponível agora
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ rotateX, rotateY, z: translateZ, transformStyle: "preserve-3d" }}
          className="heading-display text-[15vw] md:text-[11vw] lg:text-[9rem] text-nyx-ink relative"
        >
          <span
            aria-hidden
            className="absolute inset-0 text-nyx-stone/40 select-none pointer-events-none"
            style={{ transform: "translate3d(12px, 12px, -40px)" }}
          >
            Peças raras
            <br />
            para quem vê
            <br />
            antes.
          </span>
          <span className="relative">
            Peças <em className="italic font-normal">raras</em>
            <br />
            para quem <em className="italic font-normal">vê</em>
            <br />
            antes.
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 md:mt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
        >
          <p className="max-w-md text-nyx-muted leading-relaxed">
            Curadoria de drops selecionados. Quantidades limitadas. Quando
            acaba, acaba. Sem reposição, sem temporada, sem concessão.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/produtos" className="btn-primary group">
              Ver catálogo
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link href="#drops" className="btn-ghost">
              Próximo drop
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-nyx-muted"
      >
        <span className="label-mono">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-nyx-ink/40"
        />
      </motion.div>
    </section>
  );
}
