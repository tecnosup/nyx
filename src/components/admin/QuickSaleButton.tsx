"use client";

import { useState, useTransition } from "react";
import { Plus, X, Trash2, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createManualOrderAction } from "@/app/admin/(protected)/pedidos/actions";
import type { OrderItem } from "@/lib/admin-orders";
import type { PaymentMethod, Product } from "@/lib/types";
import { PAYMENT_LABELS } from "@/lib/types";

const ALL_SIZES = ["PP", "P", "M", "G", "GG", "UNICO"];
const PAYMENT_OPTIONS: PaymentMethod[] = ["pix", "cartao", "transferencia", "combinar"];

interface Props {
  products?: Product[];
}

export function QuickSaleButton({ products = [] }: Props) {
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

      {open && <QuickSaleModal products={products} onClose={() => setOpen(false)} />}
    </>
  );
}

function emptyItem(): OrderItem {
  return { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 };
}

function todayISO() {
  return new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");
}

function QuickSaleModal({ onClose, products }: { onClose: () => void; products: Product[] }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");
  const [saleDate, setSaleDate] = useState(todayISO());
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function addItem() {
    setItems((p) => [...p, emptyItem()]);
  }

  function removeItem(i: number) {
    setItems((p) => p.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, patch: Partial<OrderItem>) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  }

  function selectProduct(i: number, productId: string) {
    if (productId === "manual") {
      updateItem(i, { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 });
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const availableSizes = prod.sizes.filter((s) => s.quantity > 0).map((s) => s.size);
    const firstSize = availableSizes[0] ?? "M";
    updateItem(i, {
      productId: prod.id,
      productSlug: prod.slug,
      productName: prod.name,
      size: firstSize,
      pricePix: prod.pricePix,
      priceCard: prod.priceCard,
    });
  }

  function save() {
    setError("");
    if (!name.trim()) { setError("Nome do cliente obrigatório."); return; }
    if (items.some((it) => !it.productName.trim() || it.pricePix <= 0)) {
      setError("Preencha nome e valor de todos os itens."); return;
    }
    startTransition(async () => {
      const res = await createManualOrderAction({ customerName: name.trim(), customerPhone: phone.trim(), paymentMethod: payment, notes: notes.trim(), items, saleDate, createAsCompleted: alreadyDone });
      if (res.ok) { setSuccess(true); setTimeout(onClose, 1500); }
      else setError((res as { ok: false; error: string }).error);
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

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Pagamento</label>
                <select className="input-nyx" value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
                  {PAYMENT_OPTIONS.map((p) => <option key={p} value={p}>{PAYMENT_LABELS[p]}</option>)}
                </select>
              </div>
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Data da venda</label>
                <input
                  type="date"
                  className="input-nyx"
                  value={saleDate}
                  onChange={(e) => {
                    setSaleDate(e.target.value);
                    setAlreadyDone(e.target.value < todayISO());
                  }}
                  max={todayISO()}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={alreadyDone}
                onChange={(e) => setAlreadyDone(e.target.checked)}
                className="accent-emerald-500"
              />
              <span className="label-mono text-[10px] text-nyx-muted">
                Já concluída — lançar direto no caixa da data selecionada
              </span>
            </label>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-mono text-[10px] text-nyx-muted">Itens *</label>
                <button type="button" onClick={addItem} className="label-mono text-[10px] text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1">
                  <Plus size={11} /> Adicionar item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, i) => {
                  const selectedProd = products.find((p) => p.id === item.productId);
                  const availableSizes = selectedProd
                    ? selectedProd.sizes.filter((s) => s.quantity > 0).map((s) => s.size)
                    : ALL_SIZES;

                  return (
                    <div key={i} className="border border-nyx-line p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        {/* Product select */}
                        {products.length > 0 ? (
                          <select
                            className="input-nyx text-xs flex-1"
                            value={item.productId}
                            onChange={(e) => selectProduct(i, e.target.value)}
                          >
                            <option value="manual">— Digitar manualmente —</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="input-nyx text-xs flex-1"
                            placeholder="Nome do produto"
                            value={item.productName}
                            onChange={(e) => updateItem(i, { productName: e.target.value })}
                          />
                        )}
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} className="text-nyx-soft hover:text-red-500 shrink-0">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Manual name override when "manual" is selected */}
                      {item.productId === "manual" && products.length > 0 && (
                        <input
                          className="input-nyx text-xs"
                          placeholder="Nome do produto"
                          value={item.productName}
                          onChange={(e) => updateItem(i, { productName: e.target.value })}
                        />
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label-mono text-[9px] text-nyx-muted block mb-1">Tamanho</label>
                          <select
                            className="input-nyx text-xs"
                            value={item.size}
                            onChange={(e) => updateItem(i, { size: e.target.value })}
                          >
                            {availableSizes.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label-mono text-[9px] text-nyx-muted block mb-1">Valor (R$) *</label>
                          <input
                            className="input-nyx text-xs"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0,00"
                            value={item.pricePix || ""}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              updateItem(i, { pricePix: v, priceCard: v });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {total > 0 && (
                <p className="mt-2 text-sm text-right text-nyx-ink">Total: <strong>{formatPrice(total)}</strong></p>
              )}
            </div>

            <div>
              <label className="label-mono text-[10px] text-nyx-muted block mb-1">Observações (opcional)</label>
              <textarea className="input-nyx resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors">Cancelar</button>
              <button type="button" disabled={pending} onClick={save} className="label-mono text-xs px-5 py-2 bg-nyx-ink text-nyx-bg hover:bg-nyx-muted transition-colors disabled:opacity-50">
                {pending ? "Salvando…" : "Registrar venda"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
