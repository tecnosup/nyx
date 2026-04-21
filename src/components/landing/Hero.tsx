"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-end pb-20 md:pb-32 pt-32 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #545454 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-nyx relative">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="label-mono text-nyx-muted mb-8"
        >
          Drop 01 — Disponível agora
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="heading-display text-[15vw] md:text-[11vw] lg:text-[9rem] text-nyx-ink"
        >
          Peças <em className="italic font-normal">raras</em>
          <br />
          para quem <em className="italic font-normal">vê</em>
          <br />
          antes.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 md:mt-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8"
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
    </section>
  );
}