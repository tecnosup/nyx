import Link from "next/link";
import { createCategoryAction } from "../actions";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

export default function NovaCategoriaPage() {
  return (
    <div className="container-nyx py-12 md:py-16 max-w-2xl">
      <div className="mb-10">
        <Link href="/admin/categorias" className="label-mono text-nyx-muted hover:text-nyx-ink">
          ← Categorias
        </Link>
        <h1 className="heading-display text-3xl md:text-4xl mt-3">Nova categoria</h1>
      </div>
      <CategoryForm mode="create" action={createCategoryAction} />
    </div>
  );
}
