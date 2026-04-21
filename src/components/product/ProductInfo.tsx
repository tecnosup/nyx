import Link from "next/link";
import { CATEGORY_LABELS, type Product, type Drop } from "@/lib/types";

interface Props {
  product: Product;
  drop?: Drop | null;
}

function buildBullets(product: Product, drop?: Drop | null): string[] {
  const bullets: string[] = [];
  if (product.isLimited) bullets.push("Edição limitada · peça numerada");
  bullets.push(CATEGORY_LABELS[product.category]);
  if (drop) bullets.push(`Drop: ${drop.name}`);
  bullets.push("Envio após confirmação no WhatsApp");
  bullets.push("Pagamento combinado: Pix, cartão ou transferência");
  return bullets;
}

export function ProductInfo({ product, drop }: Props) {
  const bullets = buildBullets(product, drop);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-nyx-ink leading-[1.05] tracking-tighter">
          {product.name}
        </h1>

        <ul className="mt-6 space-y-1.5 text-sm text-nyx-muted leading-snug">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-nyx-soft">—</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-nyx-line" />

      <p className="text-sm text-nyx-muted leading-relaxed">
        {product.description}
      </p>

      {drop && (
        <Link
          href={`/drops/${drop.slug}`}
          className="inline-flex items-center gap-1 text-xs text-nyx-muted hover:text-nyx-ink transition-colors"
        >
          Sobre o drop
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
