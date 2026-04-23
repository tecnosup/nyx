import { adminListProducts } from "@/lib/admin-products";
import { getHomeSettings } from "@/lib/admin-settings";
import { FeaturedProductForm } from "@/components/admin/FeaturedProductForm";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  const [products, settings] = await Promise.all([
    adminListProducts(),
    getHomeSettings(),
  ]);

  const published = products.filter((p) => p.status === "published");

  return (
    <div className="container-nyx py-12 md:py-16 max-w-xl">
      <div className="mb-10">
        <p className="label-mono text-nyx-muted mb-2">Painel</p>
        <h1 className="heading-display text-3xl md:text-4xl">Configurações</h1>
      </div>

      <section className="border border-nyx-line p-6">
        <h2 className="label-mono text-sm mb-1">Produto em destaque</h2>
        <p className="text-sm text-nyx-muted mb-5">
          Aparece no hero da página inicial. Se nenhum for selecionado, o mais
          recente é exibido automaticamente.
        </p>
        <FeaturedProductForm
          products={published.map((p) => ({ id: p.id, name: p.name }))}
          currentId={settings.featuredProductId}
        />
      </section>
    </div>
  );
}
