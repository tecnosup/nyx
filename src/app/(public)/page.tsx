import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { Manifesto } from "@/components/landing/Manifesto";
import { FloatingMarquee } from "@/components/shared/FloatingMarquee";
import { getActiveDrop, getUpcomingDrop } from "@/lib/drops";
import { listProducts } from "@/lib/products";

function formatReleaseDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [active, upcoming, products] = await Promise.all([
    getActiveDrop(),
    getUpcomingDrop(),
    listProducts(),
  ]);

  const featured = products[0] ?? null;
  const dropLabel = active
    ? `${active.name} — Disponível agora`
    : "Drop em preparo";

  return (
    <>
      <Hero featured={featured} dropLabel={dropLabel} />

      <FloatingMarquee
        products={products}
        label="@nyx.store — No drop agora"
        speed={55}
      />

      <Manifesto />

      <section id="drops" className="py-24 md:py-32 border-t border-nyx-line">
        <div className="container-nyx text-center">
          {active ? (
            <>
              <p className="label-mono text-nyx-muted mb-4">No ar agora</p>
              <h2 className="heading-display text-4xl md:text-6xl">
                {active.name}
              </h2>
              <p className="mt-6 text-nyx-muted max-w-xl mx-auto leading-relaxed">
                {active.description}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/drops/${active.slug}`}
                  className="btn-primary"
                >
                  Ver o drop
                </Link>
                <Link href="/produtos" className="btn-ghost">
                  Catálogo completo
                </Link>
              </div>
            </>
          ) : upcoming ? (
            <>
              <p className="label-mono text-nyx-muted mb-4">Próximo drop</p>
              <h2 className="heading-display text-4xl md:text-6xl">
                {upcoming.name}
              </h2>
              <p className="mt-6 text-nyx-muted max-w-xl mx-auto leading-relaxed">
                Entra no ar em {formatReleaseDate(upcoming.releaseDate)}.
              </p>
              <div className="mt-10">
                <Link
                  href={`/drops/${upcoming.slug}`}
                  className="btn-ghost"
                >
                  Saber mais
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="label-mono text-nyx-muted mb-4">Em breve</p>
              <h2 className="heading-display text-4xl md:text-6xl">
                Próximo drop sendo preparado.
              </h2>
              <p className="mt-6 text-nyx-muted max-w-xl mx-auto">
                Siga o Instagram para saber em primeira mão.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
