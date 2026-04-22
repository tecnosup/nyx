import Link from "next/link";
import { adminListDrops } from "@/lib/admin-drops";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const drops = await adminListDrops();

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
          Novo produto
        </h1>
      </div>
      <ProductForm mode="create" drops={drops} action={createProductAction} />
    </div>
  );
}
