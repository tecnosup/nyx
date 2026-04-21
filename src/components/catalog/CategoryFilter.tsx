import Link from "next/link";
import { CATEGORY_LABELS, type ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  active: ProductCategory | "all";
  className?: string;
}

const CATEGORIES: Array<{ slug: ProductCategory | "all"; label: string }> = [
  { slug: "all", label: "Tudo" },
  { slug: "camisetas", label: CATEGORY_LABELS.camisetas },
  { slug: "moletons", label: CATEGORY_LABELS.moletons },
  { slug: "calcas", label: CATEGORY_LABELS.calcas },
  { slug: "jaquetas", label: CATEGORY_LABELS.jaquetas },
  { slug: "acessorios", label: CATEGORY_LABELS.acessorios },
];

export function CategoryFilter({ active, className }: Props) {
  return (
    <nav
      aria-label="Filtrar por categoria"
      className={cn("flex flex-wrap gap-x-6 gap-y-3", className)}
    >
      {CATEGORIES.map((cat) => {
        const href = cat.slug === "all" ? "/produtos" : `/produtos/categoria/${cat.slug}`;
        const isActive = cat.slug === active;
        return (
          <Link
            key={cat.slug}
            href={href}
            className={cn(
              "label-mono transition-colors",
              isActive
                ? "text-nyx-ink border-b border-nyx-ink pb-1"
                : "text-nyx-muted hover:text-nyx-ink"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}
