"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { setOrderStatusAction } from "@/app/admin/(protected)/pedidos/actions";
import type { Order, OrderStatus } from "@/lib/admin-orders";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-300",
  confirmed: "text-green-700 bg-green-50 border-green-300",
  cancelled: "text-nyx-soft bg-nyx-cream border-nyx-line line-through",
};

interface Props {
  orders: Order[];
}

export function OrdersTable({ orders }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          isOpen={expanded === order.id}
          onToggle={() => toggle(order.id)}
        />
      ))}
    </div>
  );
}

function OrderRow({ order, isOpen, onToggle }: { order: Order; isOpen: boolean; onToggle: () => void }) {
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<OrderStatus>(order.status);

  function handleStatus(status: OrderStatus) {
    startTransition(async () => {
      const res = await setOrderStatusAction(order.id, status);
      if (res.ok) setLocalStatus(status);
    });
  }

  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`border transition-colors ${localStatus === "cancelled" ? "border-nyx-line opacity-60" : "border-nyx-line hover:border-nyx-soft"}`}>
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_160px_120px_100px] gap-x-4 gap-y-1 items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-nyx-ink truncate">{order.customerName}</p>
            <p className="label-mono text-[10px] text-nyx-muted">{order.customerPhone}</p>
          </div>
          <span className={`label-mono text-[10px] px-2 py-1 border self-start sm:self-auto w-fit ${STATUS_STYLE[localStatus]}`}>
            {STATUS_LABEL[localStatus]}
          </span>
          <p className="hidden sm:block text-sm text-nyx-ink">{formatPrice(order.totalPix)} <span className="text-nyx-muted text-xs">Pix</span></p>
          <p className="hidden sm:block label-mono text-[10px] text-nyx-muted">{dateStr} {timeStr}</p>
        </div>
        <span className="text-nyx-muted shrink-0">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Expanded detail */}
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
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="label-mono text-[10px] text-nyx-muted mb-1">Entrega</p>
              <p className="text-nyx-ink">{order.shipping.street}, {order.shipping.number}{order.shipping.complement ? ` — ${order.shipping.complement}` : ""}</p>
              <p className="text-nyx-muted">{order.shipping.neighborhood}, {order.shipping.city} — {order.shipping.state}</p>
              <p className="text-nyx-muted">CEP {order.shipping.cep}</p>
            </div>
            <div>
              <p className="label-mono text-[10px] text-nyx-muted mb-1">Pagamento</p>
              <p className="text-nyx-ink capitalize">{order.paymentMethod}</p>
              <p className="text-nyx-ink mt-1">{formatPrice(order.totalPix)} Pix{order.totalCard > 0 ? ` / ${formatPrice(order.totalCard)} Cartão` : ""}</p>
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="label-mono text-[10px] text-nyx-muted mb-1">Observações</p>
              <p className="text-sm text-nyx-ink">{order.notes}</p>
            </div>
          )}

          {/* Ações */}
          {localStatus !== "cancelled" && (
            <div className="flex gap-3 pt-2 border-t border-nyx-line">
              {localStatus !== "confirmed" && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleStatus("confirmed")}
                  className="inline-flex items-center gap-1.5 label-mono text-xs px-4 py-2 border border-green-400 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={13} />
                  Confirmar pedido
                </button>
              )}
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
    </div>
  );
}
