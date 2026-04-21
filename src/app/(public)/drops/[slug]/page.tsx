import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getDropBySlug, listDrops } from "@/lib/drops";
import { listProductsByDrop } from "@/lib/products";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import type { Drop } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

export async function generateStaticParams() {
  const drops = await listDrops();
  return drops.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) return { title: "Drop não encontrado" };
  return {
    title: drop.name,
    description: drop.description.slice(0, 160),
    openGraph: {
      title: drop.name,
      description: drop.description.slice(0, 160),
      images: drop.heroImage ? [{ url: drop.heroImage }] : undefined,
    },
  };
}

export default async function DropDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) notFound();

  const products = await listProductsByDrop(drop.id);

  return (
    <div className="pt-32 pb-24">
      {drop.heroImage && (
        <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden bg-nyx-cream">
          <Image
            src={drop.heroImage}
            alt={drop.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nyx-bg/90 via-nyx-bg/10 to-transparent" />
        </div>
      )}

      <div className="container-nyx -mt-32 relative">
        <Link
          href="/drops"
          className="label-mono text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1 mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Todos os drops</span>
        </Link>

        <header className="max-w-3xl mb-16 md:mb-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="label-mono text-nyx-muted">
              {STATUS_LABEL[drop.status]}
            </span>
            <span className="label-mono text-nyx-soft">
              {formatReleaseDate(drop.releaseDate)}
            </span>
          </div>
          <h1 className="heading-display text-5xl md:text-7xl text-nyx-ink mb-6">
            {drop.name}
          </h1>
          <p className="text-nyx-muted leading-relaxed text-lg max-w-2xl">
            {drop.description}
          </p>
        </header>

        {drop.status === "upcoming" ? (
          <div className="border-t border-nyx-line pt-16 text-center">
            <p className="label-mono text-nyx-muted mb-4">Aguarde</p>
            <p className="heading-display text-3xl md:text-5xl text-nyx-ink max-w-2xl mx-auto">
              Este drop entra no ar em {formatReleaseDate(drop.releaseDate)}.
            </p>
          </div>
        ) : (
          <section className="border-t border-nyx-line pt-16">
            <h2 className="heading-display text-3xl md:text-4xl mb-12">
              Peças do drop
            </h2>
            <ProductGrid
              products={products}
              emptyMessage="Peças deste drop ainda não foram publicadas."
            />
          </section>
        )}
      </div>
    </div>
  );
}
