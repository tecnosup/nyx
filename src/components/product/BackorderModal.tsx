"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, MessageCircle, Loader2 } from "lucide-react";
import { buildBackorderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Product, ProductSize } from "@/lib/types";
import { SIZE_ORDER } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  phone: z.string().min(10, "WhatsApp obrigatório"),
  size: z.string().min(1, "Tamanho obrigatório"),
  color: z.string().optional(),
  notes: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  product: Product;
  onClose: () => void;
}

export function BackorderModal({ product, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { size: "", color: "", notes: "" },
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(values: FormValues) {
    try {
      await fetch("/api/checkout/backorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          pricePix: product.pricePix,
          priceCard: product.priceCard,
          size: values.size,
          color: values.color || undefined,
          name: values.name,
          phone: values.phone,
          notes: values.notes,
        }),
      });
    } catch {
      // não bloqueia — encomenda segue pelo WhatsApp mesmo se API falhar
    }

    const message = buildBackorderMessage({
      product,
      size: values.size as ProductSize,
      color: values.color || undefined,
      name: values.name,
      phone: values.phone,
      notes: values.notes,
    });
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    onClose();
  }

  const availableSizes = SIZE_ORDER.filter((s) =>
    product.sizes.some((ps) => ps.size === s)
  );
  const hasColors = product.colors && product.colors.length > 0;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-nyx-bg border border-nyx-line w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-nyx-line sticky top-0 bg-nyx-bg">
          <div>
            <p className="font-serif text-lg text-nyx-ink">Encomendar</p>
            <p className="label-mono text-[11px] text-nyx-muted mt-0.5">{product.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-nyx-muted hover:text-nyx-ink transition-colors p-1"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs text-nyx-muted mb-6 leading-relaxed">
            Produto esgotado no momento. Preencha seus dados e a Giovanna entra em contato quando estiver disponível ou para combinar uma encomenda especial.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Field label="Seu nome" error={errors.name?.message}>
              <input
                type="text"
                autoComplete="name"
                className="input-nyx"
                {...register("name")}
              />
            </Field>

            <Field label="WhatsApp (com DDD)" error={errors.phone?.message}>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="(11) 98765-4321"
                className="input-nyx"
                {...register("phone")}
              />
            </Field>

            <Field label="Tamanho desejado" error={errors.size?.message}>
              <select className="input-nyx" {...register("size")}>
                <option value="">— Selecione —</option>
                {availableSizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            {hasColors && (
              <Field label="Cor desejada (opcional)" error={errors.color?.message}>
                <select className="input-nyx" {...register("color")}>
                  <option value="">— Tanto faz —</option>
                  {product.colors.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Observação (opcional)" error={errors.notes?.message}>
              <textarea
                rows={2}
                maxLength={300}
                placeholder="Algum detalhe extra sobre a encomenda?"
                className="input-nyx resize-none"
                {...register("notes")}
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Enviando…</span>
                </>
              ) : (
                <>
                  <MessageCircle size={16} />
                  <span>Solicitar encomenda</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-nyx-muted">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-700">{error}</span>}
    </label>
  );
}
