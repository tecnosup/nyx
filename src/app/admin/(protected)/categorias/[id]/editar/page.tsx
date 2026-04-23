import Link from "next/link";
import { notFound } from "next/navigation";
import { adminListCategories } from "@/lib/admin-categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { updateCategoryAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categories = await adminListCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  const action = updateCategoryAction.bind(null, id);

  return (
    <div className="container-nyx py-12 md:py-16 max-w-2xl">
      <div className="mb-10">
        <Link href="/admin/categorias" className="label-mono text-nyx-muted hover:text-nyx-ink">
          ← Categorias
        </Link>
        <h1 className="heading-display text-3xl md:text-4xl mt-3">Editar categoria</h1>
        <p className="label-mono text-nyx-muted text-xs mt-2">{category.slug}</p>
      </div>
      <CategoryForm mode="edit" category={category} action={action} />
    </div>
  );
}
