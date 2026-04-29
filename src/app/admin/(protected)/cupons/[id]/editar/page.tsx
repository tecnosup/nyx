import { notFound } from "next/navigation";
import { adminGetCoupon } from "@/lib/admin-coupons";
import { CouponForm } from "@/components/admin/CouponForm";
import { updateCouponAction } from "../../actions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarCupomPage({ params }: Props) {
  const { id } = await params;
  const coupon = await adminGetCoupon(id);
  if (!coupon) notFound();

  const action = updateCouponAction.bind(null, id);

  return (
    <div className="container-nyx py-12 md:py-16 max-w-xl">
      <p className="label-mono text-nyx-muted mb-2">Cupons</p>
      <h1 className="heading-display text-3xl mb-10">Editar cupom</h1>
      <CouponForm action={action} defaultValues={coupon} />
    </div>
  );
}
