import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryItem {
  slug: string;
  label: string;
}

interface Props {
  active: string;
  categories: CategoryItem[];
  className?: string;
}

export function CategoryFilter({ active, categories, className }: Props) {
  const all = [{ slug: "all", label: "Tudo" }, ...categories];
  return (
    <nav
      aria-label="Filtrar por categoria"
      className={cn("flex flex-wrap gap-x-6 gap-y-3", className)}
    >
      {all.map((cat) => {
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
