import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { Manifesto } from "@/components/landing/Manifesto";
import { DropCountdown } from "@/components/landing/DropCountdown";
import { FloatingMarquee } from "@/components/shared/FloatingMarquee";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { JsonLd } from "@/components/shared/JsonLd";
import { getActiveDrop, getUpcomingDrop } from "@/lib/drops";
import { listProducts, getFeaturedProduct } from "@/lib/products";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

function formatReleaseDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [active, upcoming, products, featured] = await Promise.all([
    getActiveDrop(),
    getUpcomingDrop(),
    listProducts(),
    getFeaturedProduct(),
  ]);
  const selecionados = products.slice(0, 4);
  const dropLabel = active
    ? `${active.name} — Disponível agora`
    : "Drop em preparo";

  return (
    <>
      <JsonLd
        data={[organizationJsonLd(), websiteJsonLd()]}
        id="site-jsonld"
      />
      <Hero featured={featured} dropLabel={dropLabel} />

      <FloatingMarquee
        products={products}
        label="@nyxxwear_ — No drop agora"
        speed={55}
      />

      {upcoming && !active && (
        <DropCountdown
          releaseDate={upcoming.releaseDate}
          dropName={upcoming.name}
        />
      )}

      <Manifesto />

      {selecionados.length > 0 && (
        <section
          id="selecionados"
          className="py-24 md:py-32 border-t border-nyx-line"
        >
          <div className="container-nyx">
            <ScrollReveal className="flex items-end justify-between gap-6 mb-12 md:mb-16">
              <div>
                <p className="label-mono text-nyx-muted mb-3">Selecionados</p>
                <h2 className="heading-display text-3xl md:text-5xl">
                  Curadoria do drop.
                </h2>
              </div>
              <Link
                href="/produtos"
                className="label-mono text-nyx-ink hover:text-nyx-muted transition-colors whitespace-nowrap hidden sm:block"
              >
                Ver tudo →
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12 md:gap-y-16">
              {selecionados.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 0.08}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-12 text-center sm:hidden">
              <Link href="/produtos" className="btn-ghost">
                Ver catálogo completo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Seção de drops — editorial dark */}
      <section id="drops" className="relative overflow-hidden bg-nyx-ink py-32 md:py-44">
        {/* Ghost typography */}
        <span
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center font-serif italic text-[28vw] leading-none text-white/[0.04] whitespace-nowrap"
        >
          DROP
        </span>

        <div className="container-nyx relative text-center">
          {active ? (
            <ScrollReveal>
              <p className="label-mono text-nyx-bg/50 mb-6 tracking-widest">No ar agora</p>
              <h2 className="heading-display text-5xl md:text-7xl lg:text-8xl text-nyx-bg leading-none mb-8">
                {active.name}
              </h2>
              <p className="text-nyx-bg/60 max-w-xl mx-auto leading-relaxed mb-12 text-lg">
                {active.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/drops/${active.slug}`}
                  className="inline-flex items-center justify-center gap-2 bg-nyx-bg text-nyx-ink px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:bg-nyx-cream"
                >
                  Ver o drop
                </Link>
                <Link
                  href="/produtos"
                  className="inline-flex items-center justify-center gap-2 border border-nyx-bg/40 text-nyx-bg px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:border-nyx-bg"
                >
                  Catálogo completo
                </Link>
              </div>
            </ScrollReveal>
          ) : upcoming ? (
            <ScrollReveal>
              <p className="label-mono text-nyx-bg/50 mb-6 tracking-widest">Próximo drop</p>
              <h2 className="heading-display text-5xl md:text-7xl lg:text-8xl text-nyx-bg leading-none mb-8">
                {upcoming.name}
              </h2>
              <p className="text-nyx-bg/60 max-w-xl mx-auto leading-relaxed mb-12 text-lg">
                Entra no ar em {formatReleaseDate(upcoming.releaseDate)}.
              </p>
              <Link
                href={`/drops/${upcoming.slug}`}
                className="inline-flex items-center justify-center gap-2 border border-nyx-bg/40 text-nyx-bg px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:border-nyx-bg"
              >
                Saber mais
              </Link>
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <p className="label-mono text-nyx-bg/50 mb-6 tracking-widest">Em breve</p>
              <h2 className="heading-display text-5xl md:text-7xl lg:text-8xl text-nyx-bg leading-none mb-8">
                Próximo drop <em className="italic">sendo preparado.</em>
              </h2>
              <p className="text-nyx-bg/60 max-w-xl mx-auto text-lg">
                Siga o Instagram para saber em primeira mão.
              </p>
              <a
                href="https://www.instagram.com/nyxxwear_/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center justify-center gap-2 border border-nyx-bg/40 text-nyx-bg px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:border-nyx-bg"
              >
                @nyxxwear_
              </a>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}
