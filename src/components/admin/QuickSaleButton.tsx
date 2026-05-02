"use client";

import { useState, useTransition } from "react";
import { Plus, X, Trash2, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createManualOrderAction } from "@/app/admin/(protected)/pedidos/actions";
import type { OrderItem } from "@/lib/admin-orders";
import type { PaymentMethod } from "@/lib/types";
import { PAYMENT_LABELS } from "@/lib/types";

const SIZES = ["PP", "P", "M", "G", "GG", "UNICO"];
const PAYMENT_OPTIONS: PaymentMethod[] = ["pix", "cartao", "transferencia", "combinar"];

export function QuickSaleButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-nyx-ink text-nyx-bg label-mono text-xs hover:bg-nyx-muted transition-colors shrink-0"
      >
        <Plus size={14} />
        Nova venda
      </button>

      {open && <QuickSaleModal onClose={() => setOpen(false)} />}
    </>
  );
}

function QuickSaleModal({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function addItem() {
    setItems((p) => [...p, { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 }]);
  }

  function removeItem(i: number) {
    setItems((p) => p.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof OrderItem, value: string | number) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function save() {
    setError("");
    if (!name.trim()) { setError("Nome do cliente obrigatório."); return; }
    if (items.some((it) => !it.productName.trim() || it.pricePix <= 0)) {
      setError("Preencha nome e valor de todos os itens."); return;
    }

    startTransition(async () => {
      const res = await createManualOrderAction({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        paymentMethod: payment,
        notes: notes.trim(),
        items,
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(onClose, 1500);
      } else {
        setError((res as { ok: false; error: string }).error);
      }
    });
  }

  const total = items.reduce((s, i) => s + (i.pricePix || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-nyx-bg border border-nyx-line p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="heading-display text-xl">Nova venda</h2>
          <button onClick={onClose} className="text-nyx-muted hover:text-nyx-ink"><X size={18} /></button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle size={36} className="text-green-600 mx-auto mb-3" />
            <p className="text-nyx-ink">Venda registrada!</p>
            <p className="text-xs text-nyx-muted mt-1">Aparece em Pedidos como presencial.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Nome do cliente *</label>
                <input className="input-nyx" placeholder="Ex: Maria Silva" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Telefone (opcional)</label>
                <input className="input-nyx" placeholder="11999999999" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label-mono text-[10px] text-nyx-muted block mb-1">Pagamento</label>
              <select className="input-nyx" value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
                {PAYMENT_OPTIONS.map((p) => <option key={p} value={p}>{PAYMENT_LABELS[p]}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-mono text-[10px] text-nyx-muted">Itens *</label>
                <button type="button" onClick={addItem} className="label-mono text-[10px] text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1">
                  <Plus size={11} /> Adicionar item
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_70px_80px_auto] gap-2 items-center">
                    <input
                      className="input-nyx text-xs"
                      placeholder="Nome do produto"
                      value={item.productName}
                      onChange={(e) => updateItem(i, "productName", e.target.value)}
                    />
                    <select className="input-nyx text-xs" value={item.size} onChange={(e) => updateItem(i, "size", e.target.value)}>
                      {SIZES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <input
                      className="input-nyx text-xs"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="R$ valor"
                      value={item.pricePix || ""}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        updateItem(i, "pricePix", v);
                        updateItem(i, "priceCard", v);
                      }}
                    />
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-nyx-soft hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {total > 0 && (
                <p className="mt-2 text-sm text-right text-nyx-ink">
                  Total: <strong>{formatPrice(total)}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="label-mono text-[10px] text-nyx-muted block mb-1">Observações (opcional)</label>
              <textarea className="input-nyx resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors">
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={save}
                className="label-mono text-xs px-5 py-2 bg-nyx-ink text-nyx-bg hover:bg-nyx-muted transition-colors disabled:opacity-50"
              >
                {pending ? "Salvando…" : "Registrar venda"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
