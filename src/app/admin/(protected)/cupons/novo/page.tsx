import { CouponForm } from "@/components/admin/CouponForm";
import { createCouponAction } from "../actions";

export default function NovoCupomPage() {
  return (
    <div className="container-nyx py-12 md:py-16 max-w-xl">
      <p className="label-mono text-nyx-muted mb-2">Cupons</p>
      <h1 className="heading-display text-3xl mb-10">Novo cupom</h1>
      <CouponForm action={createCouponAction} />
    </div>
  );
}
