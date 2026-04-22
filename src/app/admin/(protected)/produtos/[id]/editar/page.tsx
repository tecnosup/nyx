import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetProduct } from "@/lib/admin-products";
import { adminListDrops } from "@/lib/admin-drops";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProductAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, drops] = await Promise.all([
    adminGetProduct(id),
    adminListDrops(),
  ]);
  if (!product) notFound();

  const action = updateProductAction.bind(null, id);

  return (
    <div className="container-nyx py-12 md:py-16 max-w-4xl">
      <div className="mb-10">
        <Link
          href="/admin/produtos"
          className="label-mono text-nyx-muted hover:text-nyx-ink"
        >
          ← Produtos
        </Link>
        <h1 className="heading-display text-3xl md:text-4xl mt-3">
          Editar produto
        </h1>
        <p className="label-mono text-nyx-muted text-xs mt-2">{product.slug}</p>
      </div>
      <ProductForm mode="edit" product={product} drops={drops} action={action} />
    </div>
  );
}
