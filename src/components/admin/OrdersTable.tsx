"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle, XCircle, Clock,
  MessageCircle, CheckCheck, Pencil, Plus, Trash2, X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  setOrderStatusAction,
  updateOrderAction,
  createManualOrderAction,
} from "@/app/admin/(protected)/pedidos/actions";
import type { Order, OrderStatus, OrderItem } from "@/lib/admin-orders";
import type { PaymentMethod, Product } from "@/lib/types";
import { PAYMENT_LABELS } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-300",
  confirmed: "text-blue-700 bg-blue-50 border-blue-300",
  completed: "text-green-700 bg-green-50 border-green-300",
  cancelled: "text-nyx-soft bg-nyx-cream border-nyx-line line-through",
};


const PAYMENT_OPTIONS: PaymentMethod[] = ["pix", "cartao", "transferencia", "combinar"];

function whatsappConfirmUrl(order: Order): string {
  const phone = `55${order.customerPhone.replace(/\D/g, "")}`;
  const items = order.items.map((i) => `• ${i.productName} (${i.size}${i.color ? ` · ${i.color}` : ""})`).join("\n");
  const text = `Olá ${order.customerName}! ✓ Seu pedido da NYX foi confirmado.\n\n${items}\n\nTotal: ${formatPrice(order.totalPix)} (${PAYMENT_LABELS[order.paymentMethod]})\n\nEm breve entraremos em contato para combinar os detalhes. Obrigada! 🖤`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

const ALL_SIZES = ["PP", "P", "M", "G", "GG", "UNICO"];

interface Props {
  orders: Order[];
  products?: Product[];
}

export function OrdersTable({ orders, products = [] }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="inline-flex items-center gap-2 label-mono text-xs px-4 py-2 border border-nyx-ink text-nyx-ink hover:bg-nyx-ink hover:text-nyx-bg transition-colors"
        >
          <Plus size={13} />
          Nova venda manual
        </button>
      </div>

      <div className="space-y-2">
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            products={products}
            isOpen={expanded === order.id}
            onToggle={() => setExpanded((p) => (p === order.id ? null : order.id))}
          />
        ))}
      </div>

      {showManual && <ManualOrderModal products={products} onClose={() => setShowManual(false)} />}
    </div>
  );
}

function OrderRow({ order, products, isOpen, onToggle }: { order: Order; products: Product[]; isOpen: boolean; onToggle: () => void }) {
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<OrderStatus>(order.status);
  const [editing, setEditing] = useState(false);

  function handleStatus(status: OrderStatus) {
    startTransition(async () => {
      const res = await setOrderStatusAction(order.id, status);
      if (res.ok) setLocalStatus(status);
    });
  }

  function handleConfirm() {
    startTransition(async () => {
      const res = await setOrderStatusAction(order.id, "confirmed");
      if (res.ok) {
        setLocalStatus("confirmed");
        window.open(whatsappConfirmUrl(order), "_blank");
      }
    });
  }

  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const isManual = order.type === "manual";

  return (
    <div className={`border transition-colors ${localStatus === "cancelled" ? "border-nyx-line opacity-60" : "border-nyx-line hover:border-nyx-soft"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_160px_120px_100px] gap-x-4 gap-y-1 items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-nyx-ink truncate">
              {order.customerName}
              {isManual && <span className="ml-2 label-mono text-[9px] text-nyx-muted border border-nyx-line px-1 py-0.5">presencial</span>}
            </p>
            <p className="label-mono text-[10px] text-nyx-muted">{order.customerPhone || "—"}</p>
          </div>
          <span className={`label-mono text-[10px] px-2 py-1 border self-start sm:self-auto w-fit ${STATUS_STYLE[localStatus]}`}>
            {STATUS_LABEL[localStatus]}
          </span>
          <p className="hidden sm:block text-sm text-nyx-ink">
            {formatPrice(order.totalPix)} <span className="text-nyx-muted text-xs">{PAYMENT_LABELS[order.paymentMethod]}</span>
          </p>
          <p className="hidden sm:block label-mono text-[10px] text-nyx-muted">{dateStr} {timeStr}</p>
        </div>
        <span className="text-nyx-muted shrink-0">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-nyx-line px-5 py-5 space-y-5 bg-nyx-cream/20">
          {/* Itens */}
          <div>
            <p className="label-mono text-[10px] text-nyx-muted mb-2">Peças</p>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-nyx-ink">
                    {item.productName}
                    <span className="text-nyx-muted ml-2">Tam. {item.size}{item.color ? ` · ${item.color}` : ""}</span>
                  </span>
                  <span className="text-nyx-muted">{formatPrice(item.pricePix)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entrega */}
          {order.shipping && (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="label-mono text-[10px] text-nyx-muted mb-1">Entrega</p>
                <p className="text-nyx-ink">{order.shipping.street}, {order.shipping.number}{order.shipping.complement ? ` — ${order.shipping.complement}` : ""}</p>
                <p className="text-nyx-muted">{order.shipping.neighborhood}, {order.shipping.city} — {order.shipping.state}</p>
                <p className="text-nyx-muted">CEP {order.shipping.cep}</p>
              </div>
              <div>
                <p className="label-mono text-[10px] text-nyx-muted mb-1">Pagamento</p>
                <p className="text-nyx-ink">{PAYMENT_LABELS[order.paymentMethod]}</p>
                <p className="text-nyx-ink mt-1">{formatPrice(order.totalPix)} Pix{order.totalCard > 0 ? ` / ${formatPrice(order.totalCard)} Cartão` : ""}</p>
              </div>
            </div>
          )}

          {!order.shipping && (
            <div className="text-sm">
              <p className="label-mono text-[10px] text-nyx-muted mb-1">Pagamento</p>
              <p className="text-nyx-ink">{PAYMENT_LABELS[order.paymentMethod]} · {formatPrice(order.totalPix)}</p>
            </div>
          )}

          {order.notes && (
            <div>
              <p className="label-mono text-[10px] text-nyx-muted mb-1">Observações</p>
              <p className="text-sm text-nyx-ink">{order.notes}</p>
            </div>
          )}

          {/* Ações */}
          {localStatus !== "cancelled" && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-nyx-line">
              {localStatus === "pending" && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 label-mono text-xs px-4 py-2 border border-green-400 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <MessageCircle size={13} />
                  Confirmar + WhatsApp
                </button>
              )}

              {(localStatus === "pending" || localStatus === "confirmed") && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleStatus("completed")}
                  className="inline-flex items-center gap-1.5 label-mono text-xs px-4 py-2 border border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  <CheckCheck size={13} />
                  Concluir
                </button>
              )}

              <button
                type="button"
                disabled={pending}
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:border-nyx-ink hover:text-nyx-ink transition-colors disabled:opacity-50"
              >
                <Pencil size={13} />
                Editar
              </button>

              <button
                type="button"
                disabled={pending}
                onClick={() => handleStatus("cancelled")}
                className="inline-flex items-center gap-1.5 label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-soft hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <XCircle size={13} />
                Cancelar
              </button>

              {pending && <Clock size={14} className="text-nyx-muted animate-pulse self-center" />}
            </div>
          )}
        </div>
      )}

      {editing && (
        <EditOrderModal
          order={{ ...order, status: localStatus }}
          products={products}
          onClose={() => setEditing(false)}
          onSaved={(status) => { setLocalStatus(status); setEditing(false); }}
        />
      )}
    </div>
  );
}

/* ─── Edit Modal ─── */
function EditOrderModal({
  order,
  products,
  onClose,
  onSaved,
}: {
  order: Order;
  products: Product[];
  onClose: () => void;
  onSaved: (status: OrderStatus) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(order.customerName);
  const [phone, setPhone] = useState(order.customerPhone);
  const [payment, setPayment] = useState<PaymentMethod>(order.paymentMethod);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [items, setItems] = useState<OrderItem[]>(order.items);
  const [error, setError] = useState("");

  function addItem() {
    setItems((prev) => [...prev, { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, patch: Partial<OrderItem>) {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  }

  function selectProduct(i: number, productId: string) {
    if (productId === "manual") { updateItem(i, { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 }); return; }
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const firstSize = prod.sizes.filter((s) => s.quantity > 0)[0]?.size ?? "M";
    updateItem(i, { productId: prod.id, productSlug: prod.slug, productName: prod.name, size: firstSize, pricePix: prod.pricePix, priceCard: prod.priceCard });
  }

  function save() {
    setError("");
    if (!name.trim()) { setError("Nome obrigatório."); return; }
    if (items.length === 0) { setError("Adicione ao menos um item."); return; }

    startTransition(async () => {
      const res = await updateOrderAction(order.id, { customerName: name.trim(), customerPhone: phone.trim(), paymentMethod: payment, notes: notes.trim(), items });
      if (res.ok) { onSaved(order.status); }
      else setError((res as { ok: false; error: string }).error);
    });
  }

  return (
    <Modal title="Editar pedido" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nome do cliente">
            <input className="input-nyx" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Telefone">
            <input className="input-nyx" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>

        <Field label="Pagamento">
          <select className="input-nyx" value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
            {PAYMENT_OPTIONS.map((p) => <option key={p} value={p}>{PAYMENT_LABELS[p]}</option>)}
          </select>
        </Field>

        <Field label="Observações">
          <textarea className="input-nyx resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label-mono text-[10px] text-nyx-muted">Itens</p>
            <button type="button" onClick={addItem} className="label-mono text-[10px] text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1">
              <Plus size={11} /> Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => {
              const selProd = products.find((p) => p.id === item.productId);
              const availSizes = selProd ? selProd.sizes.filter((s) => s.quantity > 0).map((s) => s.size) : ALL_SIZES;
              return (
                <div key={i} className="border border-nyx-line p-3 space-y-2">
                  <div className="flex gap-2">
                    {products.length > 0 ? (
                      <select className="input-nyx text-xs flex-1" value={item.productId} onChange={(e) => selectProduct(i, e.target.value)}>
                        <option value="manual">— Digitar manualmente —</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    ) : (
                      <input className="input-nyx text-xs flex-1" placeholder="Produto" value={item.productName} onChange={(e) => updateItem(i, { productName: e.target.value })} />
                    )}
                    <button type="button" onClick={() => removeItem(i)} className="text-nyx-soft hover:text-red-500 shrink-0"><Trash2 size={13} /></button>
                  </div>
                  {item.productId === "manual" && products.length > 0 && (
                    <input className="input-nyx text-xs" placeholder="Nome do produto" value={item.productName} onChange={(e) => updateItem(i, { productName: e.target.value })} />
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-mono text-[9px] text-nyx-muted block mb-1">Tamanho</label>
                      <select className="input-nyx text-xs" value={item.size} onChange={(e) => updateItem(i, { size: e.target.value })}>
                        {availSizes.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-mono text-[9px] text-nyx-muted block mb-1">Valor (R$)</label>
                      <input className="input-nyx text-xs" type="number" placeholder="0,00" value={item.pricePix || ""} onChange={(e) => { const v = parseFloat(e.target.value) || 0; updateItem(i, { pricePix: v, priceCard: v }); }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors">Cancelar</button>
          <button type="button" disabled={pending} onClick={save} className="label-mono text-xs px-4 py-2 border border-nyx-ink text-nyx-bg bg-nyx-ink hover:bg-nyx-muted transition-colors disabled:opacity-50">
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Manual Order Modal ─── */
function ManualOrderModal({ onClose, products }: { onClose: () => void; products: Product[] }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([{ productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function addItem() {
    setItems((prev) => [...prev, { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, patch: Partial<OrderItem>) {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  }

  function selectProduct(i: number, productId: string) {
    if (productId === "manual") { updateItem(i, { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 }); return; }
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const firstSize = prod.sizes.filter((s) => s.quantity > 0)[0]?.size ?? "M";
    updateItem(i, { productId: prod.id, productSlug: prod.slug, productName: prod.name, size: firstSize, pricePix: prod.pricePix, priceCard: prod.priceCard });
  }

  function save() {
    setError("");
    if (!name.trim()) { setError("Nome do cliente obrigatório."); return; }
    if (items.some((it) => !it.productName.trim() || it.pricePix <= 0)) {
      setError("Preencha nome e valor de todos os itens."); return;
    }
    startTransition(async () => {
      const res = await createManualOrderAction({ customerName: name.trim(), customerPhone: phone.trim(), paymentMethod: payment, notes: notes.trim(), items });
      if (res.ok) { setSuccess(true); setTimeout(onClose, 1200); }
      else setError((res as { ok: false; error: string }).error);
    });
  }

  const total = items.reduce((s, i) => s + (i.pricePix || 0), 0);

  return (
    <Modal title="Nova venda manual" onClose={onClose}>
      {success ? (
        <div className="py-6 text-center">
          <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
          <p className="text-sm text-nyx-ink">Venda registrada com sucesso!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nome do cliente *">
              <input className="input-nyx" placeholder="Ex: Maria Silva" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Telefone (opcional)">
              <input className="input-nyx" placeholder="Ex: 11999999999" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </div>

          <Field label="Forma de pagamento">
            <select className="input-nyx" value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
              {PAYMENT_OPTIONS.map((p) => <option key={p} value={p}>{PAYMENT_LABELS[p]}</option>)}
            </select>
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="label-mono text-[10px] text-nyx-muted">Itens *</p>
              <button type="button" onClick={addItem} className="label-mono text-[10px] text-nyx-muted hover:text-nyx-ink inline-flex items-center gap-1">
                <Plus size={11} /> Adicionar item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => {
                const selProd = products.find((p) => p.id === item.productId);
                const availSizes = selProd ? selProd.sizes.filter((s) => s.quantity > 0).map((s) => s.size) : ALL_SIZES;
                return (
                  <div key={i} className="border border-nyx-line p-3 space-y-2">
                    <div className="flex gap-2">
                      {products.length > 0 ? (
                        <select className="input-nyx text-xs flex-1" value={item.productId} onChange={(e) => selectProduct(i, e.target.value)}>
                          <option value="manual">— Digitar manualmente —</option>
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      ) : (
                        <input className="input-nyx text-xs flex-1" placeholder="Nome do produto" value={item.productName} onChange={(e) => updateItem(i, { productName: e.target.value })} />
                      )}
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-nyx-soft hover:text-red-500 shrink-0"><Trash2 size={13} /></button>
                      )}
                    </div>
                    {item.productId === "manual" && products.length > 0 && (
                      <input className="input-nyx text-xs" placeholder="Nome do produto" value={item.productName} onChange={(e) => updateItem(i, { productName: e.target.value })} />
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label-mono text-[9px] text-nyx-muted block mb-1">Tamanho</label>
                        <select className="input-nyx text-xs" value={item.size} onChange={(e) => updateItem(i, { size: e.target.value })}>
                          {availSizes.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-mono text-[9px] text-nyx-muted block mb-1">Valor (R$) *</label>
                        <input className="input-nyx text-xs" type="number" min="0" step="0.01" placeholder="0,00" value={item.pricePix || ""} onChange={(e) => { const v = parseFloat(e.target.value) || 0; updateItem(i, { pricePix: v, priceCard: v }); }} />
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

          <Field label="Observações (opcional)">
            <textarea className="input-nyx resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors">Cancelar</button>
            <button type="button" disabled={pending} onClick={save} className="label-mono text-xs px-4 py-2 border border-nyx-ink text-nyx-bg bg-nyx-ink hover:bg-nyx-muted transition-colors disabled:opacity-50">
              {pending ? "Salvando…" : "Registrar venda"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ─── Shared ─── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-nyx-bg border border-nyx-line p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="heading-display text-xl">{title}</h2>
          <button onClick={onClose} className="text-nyx-muted hover:text-nyx-ink"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-mono text-[10px] text-nyx-muted block mb-1">{label}</label>
      {children}
    </div>
  );
}
