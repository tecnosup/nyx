"use client";

import { motion } from "framer-motion";

export function Manifesto() {
  return (
    <section className="py-32 md:py-48">
      <div className="container-nyx">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="max-w-4xl"
        >
          <p className="label-mono text-nyx-muted mb-8">Manifesto</p>

          <h2 className="heading-display text-4xl md:text-6xl lg:text-7xl text-nyx-ink">
            Não é sobre <em className="italic">seguir</em> a moda.
            <br />É sobre <em className="italic">sair dela</em>.
          </h2>

          <div className="mt-16 grid md:grid-cols-2 gap-8 md:gap-16 text-nyx-muted leading-relaxed text-lg">
            <p>
              NYX nasceu do incômodo de ver as mesmas peças em todo mundo.
              Vitrines clonadas, coleções inteiras fabricadas em escala, estilo
              como commodity. A gente caça o oposto.
            </p>
            <p>
              Cada drop é uma garimpagem. Peças selecionadas de lugares
              diferentes, quantidades que cabem na ponta dos dedos, e a
              promessa de que você não vai cruzar com alguém usando a mesma
              coisa na rua.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}