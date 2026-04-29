"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { shippingSchema, paymentMethodSchema } from "@/lib/checkout";
import { buildCartOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { PAYMENT_LABELS, type PaymentMethod } from "@/lib/types";
import type { CartItem } from "@/lib/cart";
import { CouponInput, calcDiscount, type AppliedCoupon } from "./CouponInput";
import { formatPrice } from "@/lib/utils";

const formSchema = z.object({
  shipping: shippingSchema,
  paymentMethod: paymentMethodSchema,
  notes: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const PAYMENT_OPTIONS: PaymentMethod[] = [
  "pix",
  "cartao",
  "transferencia",
  "combinar",
];

interface Props {
  items: CartItem[];
  onSuccess: () => void;
}

export function CartCheckoutForm({ items, onSuccess }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shipping: {
        name: "", phone: "", cep: "", street: "", number: "",
        complement: "", neighborhood: "", city: "", state: "",
      },
      paymentMethod: "pix",
      notes: "",
    },
  });

  async function lookupCep(raw: string) {
    const d = raw.replace(/\D/g, "");
    if (d.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.erro) return;
      setValue("shipping.street", data.logradouro ?? "", { shouldValidate: false });
      setValue("shipping.neighborhood", data.bairro ?? "", { shouldValidate: false });
      setValue("shipping.city", data.localidade ?? "", { shouldValidate: false });
      setValue("shipping.state", (data.uf ?? "").toUpperCase(), { shouldValidate: false });
      setFocus("shipping.number");
    } catch { /* ignore */ } finally {
      setLoadingCep(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productSlug: i.productSlug,
            productName: i.productName,
            size: i.size,
            color: i.color,
            pricePix: i.pricePix,
            priceCard: i.priceCard,
          })),
          ...values,
        }),
      });

      if (res.status === 429) {
        setServerError("Muitas tentativas. Tente novamente em instantes.");
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setServerError("Não foi possível registrar o pedido. Confira os dados.");
        return;
      }

      const message = buildCartOrderMessage({
        items,
        shipping: values.shipping,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
        coupon: coupon ?? undefined,
      });
      window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
      onSuccess();
    } catch {
      setServerError("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
      <section className="space-y-5">
        <h2 className="label-mono text-nyx-muted">Contato</h2>
        <Field label="Nome completo" error={errors.shipping?.name?.message}>
          <input type="text" autoComplete="name" className="input-nyx" {...register("shipping.name")} />
        </Field>
        <Field label="WhatsApp (com DDD)" error={errors.shipping?.phone?.message}>
          <input type="tel" autoComplete="tel" placeholder="(11) 98765-4321" className="input-nyx" {...register("shipping.phone")} />
        </Field>
      </section>

      <section className="space-y-5">
        <h2 className="label-mono text-nyx-muted">Endereço de entrega</h2>
        <Field label="CEP" error={errors.shipping?.cep?.message}>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              className="input-nyx pr-10"
              {...register("shipping.cep", { onBlur: (e) => lookupCep(e.target.value) })}
            />
            {loadingCep && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-nyx-muted animate-spin" />
            )}
          </div>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
          <Field label="Rua" error={errors.shipping?.street?.message}>
            <input type="text" autoComplete="address-line1" className="input-nyx" {...register("shipping.street")} />
          </Field>
          <Field label="Número" error={errors.shipping?.number?.message}>
            <input type="text" className="input-nyx" {...register("shipping.number")} />
          </Field>
        </div>
        <Field label="Complemento (opcional)" error={errors.shipping?.complement?.message}>
          <input type="text" autoComplete="address-line2" className="input-nyx" {...register("shipping.complement")} />
        </Field>
        <Field label="Bairro" error={errors.shipping?.neighborhood?.message}>
          <input type="text" className="input-nyx" {...register("shipping.neighborhood")} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-4">
          <Field label="Cidade" error={errors.shipping?.city?.message}>
            <input type="text" autoComplete="address-level2" className="input-nyx" {...register("shipping.city")} />
          </Field>
          <Field label="UF" error={errors.shipping?.state?.message}>
            <input type="text" maxLength={2} autoComplete="address-level1" className="input-nyx uppercase" {...register("shipping.state")} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="label-mono text-nyx-muted">Forma de pagamento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAYMENT_OPTIONS.map((method) => (
            <label
              key={method}
              className="flex items-center gap-3 border border-nyx-line px-4 py-3 cursor-pointer hover:border-nyx-ink transition-colors has-[:checked]:border-nyx-ink has-[:checked]:bg-nyx-cream/40"
            >
              <input type="radio" value={method} className="accent-nyx-ink" {...register("paymentMethod")} />
              <span className="text-sm">{PAYMENT_LABELS[method]}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="label-mono text-nyx-muted">Observações (opcional)</h2>
        <textarea rows={3} maxLength={500} placeholder="Alguma informação extra?" className="input-nyx resize-none" {...register("notes")} />
      </section>

      <section className="space-y-3">
        <h2 className="label-mono text-nyx-muted">Cupom de desconto (opcional)</h2>
        <CouponInput applied={coupon} onApply={setCoupon} />
        {coupon && (() => {
          const subtotalPix = items.reduce((s, i) => s + i.pricePix, 0);
          const discount = calcDiscount(coupon, subtotalPix);
          const final = Math.max(0, subtotalPix - discount);
          return (
            <div className="text-sm text-nyx-muted">
              Pix: <span className="line-through">{formatPrice(subtotalPix)}</span>{" "}
              <span className="text-nyx-ink font-semibold">{formatPrice(final)}</span>
            </div>
          );
        })()}
      </section>

      {serverError && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <><Loader2 size={18} className="animate-spin" /><span>Enviando…</span></>
        ) : (
          <><MessageCircle size={18} /><span>Finalizar pelo WhatsApp</span></>
        )}
      </button>

      <p className="text-xs text-nyx-muted leading-relaxed">
        Ao confirmar, abrimos uma conversa no WhatsApp com o pedido já formatado.
        A Giovanna confirma frete, prazo e pagamento antes da cobrança.
      </p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-nyx-muted">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-700">{error}</span>}
    </label>
  );
}
