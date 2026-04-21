import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listDrops } from "@/lib/drops";
import type { Drop } from "@/lib/types";

export const metadata: Metadata = {
  title: "Drops",
  description:
    "Os drops da NYX. Curadoria, contexto e peças selecionadas de cada edição — passada, presente e futura.",
};

const STATUS_LABEL: Record<Drop["status"], string> = {
  active: "No ar",
  upcoming: "Em breve",
  archived: "Arquivado",
};

function formatReleaseDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function DropsPage() {
  const drops = await listDrops();

  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx">
        <header className="mb-16 md:mb-24">
          <p className="label-mono text-nyx-muted mb-4">Drops</p>
          <h1 className="heading-display text-5xl md:text-7xl text-nyx-ink">
            Cada drop, <em className="italic font-normal">uma ideia</em>.
          </h1>
          <p className="mt-6 text-nyx-muted max-w-xl leading-relaxed">
            Drops são cápsulas. Curadoria pequena, narrativa própria, estoque
            finito. Quando fecha, fecha.
          </p>
        </header>

        {drops.length === 0 ? (
          <p className="label-mono text-nyx-muted py-24 text-center">
            Nenhum drop publicado ainda.
          </p>
        ) : (
          <ul className="space-y-16 md:space-y-24">
            {drops.map((drop) => (
              <li key={drop.id}>
                <Link
                  href={`/drops/${drop.slug}`}
                  className="group grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 md:gap-12 items-center"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-nyx-cream">
                    {drop.heroImage ? (
                      <Image
                        src={drop.heroImage}
                        alt={drop.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="label-mono text-nyx-muted">
                        {STATUS_LABEL[drop.status]}
                      </span>
                      <span className="label-mono text-nyx-soft">
                        {formatReleaseDate(drop.releaseDate)}
                      </span>
                    </div>
                    <h2 className="heading-display text-3xl md:text-5xl text-nyx-ink mb-5 group-hover:text-nyx-muted transition-colors">
                      {drop.name}
                    </h2>
                    <p className="text-nyx-muted leading-relaxed max-w-lg">
                      {drop.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
