"use client";

import { useState, useMemo, useTransition } from "react";
import {
  ChevronLeft, ChevronRight, Lock, LockOpen, Plus, Pencil, Trash2, X, CheckCircle, Calendar,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  reopenCaixaAction,
  deleteOrderAction,
  closeCaixaForDateAction,
  updateOrderAction,
} from "@/app/admin/(protected)/pedidos/actions";
import { QuickSaleModal } from "@/components/admin/QuickSaleButton";
import type { Caixa } from "@/lib/admin-caixa";
import type { Order, OrderItem } from "@/lib/admin-orders";
import type { Product, PaymentMethod } from "@/lib/types";
import { PAYMENT_LABELS, SIZE_LABELS } from "@/lib/types";
import type { Gasto } from "@/lib/admin-gastos";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ALL_SIZES = ["PP", "P", "M", "G", "GG", "UNICO"];
const PAYMENT_OPTIONS: PaymentMethod[] = ["pix", "cartao", "transferencia", "combinar"];

function todaySP(): string {
  return new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");
}

function orderDateKey(o: Order): string {
  if (o.saleDate) return o.saleDate;
  return new Date(o.createdAt).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");
}

function buildMonthCells(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function fmtBR(iso: string) {
  return iso.split("-").reverse().join("/");
}

// Compact price for calendar cells: R$120 | R$1,7k
function compactPrice(val: number): string {
  if (val >= 1000) return `R$${(val / 1000).toFixed(1).replace(".", ",")}k`;
  return `R$${Math.round(val)}`;
}

interface Props {
  caixas: Caixa[];
  openOrders: Order[];
  products: Product[];
  gastos?: Gasto[];
}

export function CaixaCalendar({ caixas, openOrders, products, gastos = [] }: Props) {
  const today = todaySP();
  const now = new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showAddSale, setShowAddSale] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [pending, startTransition] = useTransition();
  const [reopeningId, setReopeningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [closingDate, setClosingDate] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const caixaByDate = useMemo(() => {
    const m = new Map<string, Caixa>();
    for (const c of caixas) m.set(c.date, c);
    return m;
  }, [caixas]);

  const openByDate = useMemo(() => {
    const m = new Map<string, Order[]>();
    for (const o of openOrders) {
      const d = orderDateKey(o);
      const arr = m.get(d) ?? [];
      arr.push(o);
      m.set(d, arr);
    }
    return m;
  }, [openOrders]);

  const gastosByDate = useMemo(() => {
    const m = new Map<string, Gasto[]>();
    for (const g of gastos) {
      if (!g.date) continue;
      const arr = m.get(g.date) ?? [];
      arr.push(g);
      m.set(g.date, arr);
    }
    return m;
  }, [gastos]);

  const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setSuccessMsg("");
  }

  function handleReopen(caixaId: string) {
    if (!confirm("Reabrir este caixa? Os pedidos voltarão para o caixa aberto e o fechamento será removido.")) return;
    setReopeningId(caixaId);
    startTransition(async () => {
      await reopenCaixaAction(caixaId);
      setReopeningId(null);
    });
  }

  function handleDelete(orderId: string) {
    if (!confirm("Excluir este pedido? Esta ação não pode ser desfeita.")) return;
    setDeletingId(orderId);
    startTransition(async () => {
      await deleteOrderAction(orderId);
      setDeletingId(null);
    });
  }

  function handleCloseDate(date: string) {
    setClosingDate(date);
    startTransition(async () => {
      const res = await closeCaixaForDateAction(date);
      setClosingDate(null);
      if (res.ok && res.count !== undefined) {
        setSuccessMsg(`Caixa fechado — ${res.count} pedido${res.count > 1 ? "s" : ""} · ${formatPrice(res.total ?? 0)}`);
      }
    });
  }

  const selCaixa = caixaByDate.get(selectedDate);
  const selOpen = openByDate.get(selectedDate) ?? [];
  const selGastos = gastosByDate.get(selectedDate) ?? [];
  const isFutureDay = selectedDate > today;
  const hasActivity = !!(selCaixa || selOpen.length > 0);

  return (
    <>
      {/* Detail panel — always visible, updates with selected day */}
      <div className="border border-nyx-line p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={13} className="text-nyx-muted shrink-0" />
          <p className="label-mono text-sm text-nyx-ink">{fmtBR(selectedDate)}</p>
          {selectedDate === today && (
            <span className="label-mono text-[9px] px-2 py-0.5 border border-nyx-line text-nyx-soft">Hoje</span>
          )}
          {selCaixa && (
            <>
              <Lock size={11} className="text-nyx-muted shrink-0 ml-1" />
              <span className="label-mono text-[9px] px-2 py-0.5 border border-nyx-line text-nyx-muted">
                {selCaixa.orderCount} pedido{selCaixa.orderCount > 1 ? "s" : ""}
              </span>
            </>
          )}
          {selOpen.length > 0 && (
            <>
              <LockOpen size={11} className="text-amber-500 shrink-0 ml-1" />
              <span className="label-mono text-[9px] px-2 py-0.5 border border-amber-400 text-amber-500">
                {selOpen.length} aberto{selOpen.length > 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        {/* Closed caixa summary */}
        {selCaixa && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CaixaStat label="Pix" value={formatPrice(selCaixa.totalPix)} />
              <CaixaStat label="Cartão" value={formatPrice(selCaixa.totalCard)} />
              {selCaixa.totalTransferencia > 0 && (
                <CaixaStat label="Transferência" value={formatPrice(selCaixa.totalTransferencia)} />
              )}
              {selCaixa.totalCombinar > 0 && (
                <CaixaStat label="Combinar" value={formatPrice(selCaixa.totalCombinar)} />
              )}
              <CaixaStat label="Total geral" value={formatPrice(selCaixa.totalGeral)} bold />
            </div>
            <div className="flex justify-end">
              <button
                disabled={pending && reopeningId === selCaixa.id}
                onClick={() => handleReopen(selCaixa.id)}
                className="inline-flex items-center gap-1.5 label-mono text-[10px] px-3 py-1.5 border border-nyx-line text-nyx-muted hover:text-nyx-ink hover:border-nyx-muted transition-colors disabled:opacity-40"
              >
                <LockOpen size={11} />
                {pending && reopeningId === selCaixa.id ? "Reabrindo…" : "Reabrir caixa"}
              </button>
            </div>
          </div>
        )}

        {/* Open / editable orders */}
        {selOpen.length > 0 && (
          <div className="space-y-2">
            {selOpen.map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-2 border-b border-nyx-line/40 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-nyx-ink truncate">{o.customerName}</p>
                  <p className="text-[10px] text-nyx-muted">
                    {PAYMENT_LABELS[o.paymentMethod]} · {formatPrice(o.totalPix)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingOrder(o)}
                    title="Editar pedido"
                    className="p-1.5 text-nyx-soft hover:text-nyx-ink transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    disabled={pending && deletingId === o.id}
                    onClick={() => handleDelete(o.id)}
                    title="Excluir pedido"
                    className="p-1.5 text-nyx-soft hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
              <button
                onClick={() => setShowAddSale(true)}
                className="inline-flex items-center gap-1.5 label-mono text-[10px] px-3 py-1.5 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors"
              >
                <Plus size={11} />
                Adicionar venda
              </button>
              <button
                disabled={pending && closingDate === selectedDate}
                onClick={() => handleCloseDate(selectedDate)}
                className="inline-flex items-center gap-1.5 label-mono text-[10px] px-4 py-1.5 border border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-40"
              >
                <Lock size={11} />
                {pending && closingDate === selectedDate ? "Fechando…" : "Fechar caixa"}
              </button>
            </div>
          </div>
        )}

        {/* Empty day */}
        {!hasActivity && (
          <div className="space-y-2">
            <p className="text-xs text-nyx-soft">Nenhuma venda registrada neste dia.</p>
            {!isFutureDay && (
              <button
                onClick={() => setShowAddSale(true)}
                className="w-full justify-center inline-flex items-center gap-1.5 label-mono text-[10px] px-3 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors"
              >
                <Plus size={11} />
                Adicionar venda retroativa
              </button>
            )}
          </div>
        )}

        {/* Gastos do dia */}
        {selGastos.length > 0 && (
          <div className="pt-3 border-t border-nyx-line/50">
            <p className="label-mono text-[9px] text-nyx-soft mb-2">Gastos registrados</p>
            <div className="space-y-1.5">
              {selGastos.map((g) => (
                <div key={g.id} className="flex items-center justify-between text-xs">
                  <span className="text-nyx-muted truncate">{g.description}</span>
                  <span className="text-red-400 shrink-0 ml-2 tabular-nums">− {formatPrice(g.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {successMsg && <p className="text-xs text-emerald-500">{successMsg}</p>}
      </div>

      {/* Calendar */}
      <div className="border border-nyx-line p-5 space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1 text-nyx-muted hover:text-nyx-ink transition-colors">
            <ChevronLeft size={16} />
          </button>
          <p className="label-mono text-xs text-nyx-ink uppercase tracking-widest">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button onClick={nextMonth} className="p-1 text-nyx-muted hover:text-nyx-ink transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {DOW.map((d) => (
            <div key={d} className="text-center label-mono text-[9px] text-nyx-soft py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((iso, idx) => {
            if (!iso) return <div key={idx} className="min-h-[48px]" />;

            const hasCaixa = caixaByDate.has(iso);
            const hasOpen = openByDate.has(iso);
            const hasGasto = gastosByDate.has(iso);
            const isToday = iso === today;
            const isFuture = iso > today;
            const isSelected = iso === selectedDate;
            const caixa = caixaByDate.get(iso);
            const dayNum = Number(iso.split("-")[2]);

            return (
              <button
                key={iso}
                onClick={() => selectDate(iso)}
                disabled={isFuture && !hasCaixa && !hasOpen}
                className={[
                  "relative flex flex-col items-center justify-center min-h-[48px] px-0.5 py-1.5 border transition-all overflow-hidden",
                  isSelected
                    ? "border-nyx-ink bg-nyx-ink"
                    : hasCaixa
                    ? "border-nyx-line hover:border-nyx-muted cursor-pointer"
                    : hasOpen
                    ? "border-amber-400/50 hover:border-amber-400 cursor-pointer"
                    : isToday
                    ? "border-nyx-muted/50 hover:border-nyx-muted cursor-pointer"
                    : isFuture
                    ? "border-transparent opacity-25 cursor-default"
                    : "border-transparent hover:border-nyx-line/50 cursor-pointer opacity-50",
                ].join(" ")}
              >
                <span className={`label-mono text-[11px] ${isSelected ? "text-nyx-bg" : "text-nyx-ink"}`}>
                  {dayNum}
                </span>
                {hasCaixa && (
                  <>
                    <span className={`hidden sm:block label-mono text-[8px] leading-tight mt-0.5 w-full text-center truncate ${isSelected ? "text-nyx-bg/70" : "text-nyx-muted"}`}>
                      {compactPrice(caixa!.totalGeral)}
                    </span>
                    <span className={`sm:hidden w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-nyx-bg/60" : "bg-nyx-muted"}`} />
                  </>
                )}
                {hasOpen && !hasCaixa && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-amber-300" : "bg-amber-400"}`} />
                )}
                {hasGasto && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-red-300" : "bg-red-400/70"}`} />
                )}
                {isToday && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-px bg-nyx-muted" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-5 pt-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-nyx-line" />
            <span className="label-mono text-[9px] text-nyx-muted">Caixa fechado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-amber-400/50" />
            <span className="label-mono text-[9px] text-nyx-muted">Pendente / aberto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400/70" />
            <span className="label-mono text-[9px] text-nyx-muted">Gasto registrado</span>
          </div>
        </div>
      </div>

      {showAddSale && (
        <QuickSaleModal
          products={products}
          initialDate={selectedDate}
          onClose={() => setShowAddSale(false)}
        />
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          products={products}
          onClose={() => setEditingOrder(null)}
        />
      )}
    </>
  );
}

function CaixaStat({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <p className="label-mono text-[9px] text-nyx-muted mb-0.5">{label}</p>
      <p className={`text-sm text-nyx-ink ${bold ? "font-medium" : ""}`}>{value}</p>
    </div>
  );
}

function emptyItem(): OrderItem {
  return { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 };
}

function EditOrderModal({
  order,
  products,
  onClose,
}: {
  order: Order;
  products: Product[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(order.customerName);
  const [phone, setPhone] = useState(order.customerPhone ?? "");
  const [payment, setPayment] = useState<PaymentMethod>(order.paymentMethod);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [items, setItems] = useState<OrderItem[]>(order.items.length > 0 ? order.items : [emptyItem()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function addItem() { setItems((p) => [...p, emptyItem()]); }
  function removeItem(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, patch: Partial<OrderItem>) {
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function selectProduct(i: number, productId: string) {
    if (productId === "manual") {
      updateItem(i, { productId: "manual", productSlug: "manual", productName: "", size: "M", pricePix: 0, priceCard: 0 });
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const firstSize = prod.sizes.find((s) => s.quantity > 0)?.size ?? "M";
    updateItem(i, { productId: prod.id, productSlug: prod.slug, productName: prod.name, size: firstSize, pricePix: prod.pricePix, priceCard: prod.priceCard });
  }

  function save() {
    setError("");
    if (!name.trim()) { setError("Nome do cliente obrigatório."); return; }
    if (items.some((it) => !it.productName.trim() || it.pricePix <= 0)) {
      setError("Preencha nome e valor de todos os itens."); return;
    }
    startTransition(async () => {
      const res = await updateOrderAction(order.id, {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        paymentMethod: payment,
        notes: notes.trim() || undefined,
        items,
      });
      if (res.ok) { setSuccess(true); setTimeout(onClose, 1200); }
      else setError((res as { ok: false; error: string }).error);
    });
  }

  const total = items.reduce((s, i) => s + (i.pricePix || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-nyx-bg border border-nyx-line p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="heading-display text-xl">Editar pedido</h2>
          <button onClick={onClose} className="text-nyx-muted hover:text-nyx-ink"><X size={18} /></button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle size={36} className="text-green-600 mx-auto mb-3" />
            <p className="text-nyx-ink">Pedido atualizado!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Nome do cliente *</label>
                <input className="input-nyx" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Telefone</label>
                <input className="input-nyx" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
              <div className="space-y-3">
                {items.map((item, i) => {
                  const selProd = products.find((p) => p.id === item.productId);
                  const sizes = selProd ? selProd.sizes.filter((s) => s.quantity > 0).map((s) => s.size) : ALL_SIZES;
                  return (
                    <div key={i} className="border border-nyx-line p-3 space-y-2">
                      <div className="flex items-center gap-2">
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
                            {sizes.map((s) => <option key={s} value={s}>{SIZE_LABELS[s as keyof typeof SIZE_LABELS] ?? s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label-mono text-[9px] text-nyx-muted block mb-1">Valor (R$) *</label>
                          <input
                            className="input-nyx text-xs" type="number" min="0" step="0.01" placeholder="0,00"
                            value={item.pricePix || ""}
                            onChange={(e) => { const v = parseFloat(e.target.value) || 0; updateItem(i, { pricePix: v, priceCard: v }); }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {total > 0 && <p className="mt-2 text-sm text-right text-nyx-ink">Total: <strong>{formatPrice(total)}</strong></p>}
            </div>
            <div>
              <label className="label-mono text-[10px] text-nyx-muted block mb-1">Observações</label>
              <textarea className="input-nyx resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors">Cancelar</button>
              <button type="button" disabled={pending} onClick={save} className="label-mono text-xs px-5 py-2 bg-nyx-ink text-nyx-bg hover:bg-nyx-muted transition-colors disabled:opacity-50">
                {pending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
