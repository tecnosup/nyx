"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const leftY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const rightY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const labelY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const ghostY = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const ghostOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 0.08, 0.08, 0]
  );

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-36 overflow-hidden"
    >
      <motion.div
        aria-hidden
        style={{ y: ghostY, opacity: ghostOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span className="font-serif italic text-[22vw] leading-none text-nyx-ink whitespace-nowrap">
          NYX
        </span>
      </motion.div>

      <div className="container-nyx relative">
        <motion.p
          style={{ y: labelY }}
          className="label-mono text-nyx-muted mb-6"
        >
          Manifesto
        </motion.p>

        <motion.h2
          style={{ y: titleY }}
          className="heading-display text-4xl md:text-6xl lg:text-7xl text-nyx-ink"
        >
          Nasceu de um <em className="italic">reencontro</em>.
          <br />Cresceu como <em className="italic">negócio</em>.
        </motion.h2>

        <div className="mt-14 grid md:grid-cols-2 gap-8 md:gap-16 text-nyx-muted leading-relaxed text-lg">
          <motion.p style={{ y: leftY }}>
            A NYX nasceu de um reencontro. Criada por quem sempre amou moda,
            mas precisou de um empurrão da vida para transformar a paixão em
            negócio. Hoje, selecionamos a dedo o que há de mais atual na moda
            e nas tendências globais para elevar sua autoestima.
          </motion.p>
          <motion.p style={{ y: rightY }}>
            Estamos em constante evolução, com o pé no presente e o olhar no
            futuro: o sonho de criar nossa própria linha já está sendo
            desenhado. Obrigada por fazer parte desse sonho.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
