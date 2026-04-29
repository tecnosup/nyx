import Link from "next/link";
import { adminListCoupons } from "@/lib/admin-coupons";
import { CouponsTable } from "@/components/admin/CouponsTable";

export const dynamic = "force-dynamic";

export default async function CuponsPage() {
  const coupons = await adminListCoupons();

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-mono text-nyx-muted mb-2">Admin</p>
          <h1 className="heading-display text-3xl md:text-4xl">Cupons</h1>
        </div>
        <Link
          href="/admin/cupons/novo"
          className="cta-pill px-5 py-2 text-xs"
        >
          + Novo cupom
        </Link>
      </div>

      {coupons.length === 0 ? (
        <div className="border border-dashed border-nyx-line p-12 text-center">
          <p className="text-nyx-muted text-sm">Nenhum cupom cadastrado.</p>
          <Link href="/admin/cupons/novo" className="mt-4 inline-block text-sm underline text-nyx-ink">
            Criar primeiro cupom
          </Link>
        </div>
      ) : (
        <CouponsTable coupons={coupons} />
      )}
    </div>
  );
}
