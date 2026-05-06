"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ShoppingBag, PackagePlus, RotateCcw, SlidersHorizontal } from "lucide-react";
import { SIZE_LABELS } from "@/lib/types";

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  size: string;
  delta: number;
  type: string;
  orderId?: string;
  notes?: string;
  date: string;
  createdAt: number;
}

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ReactNode;
  iconClass: string;
  deltaClass: string;
}> = {
  venda: {
    label: "Venda",
    icon: <ShoppingBag size={13} />,
    iconClass: "border-amber-400/60 text-amber-500 bg-amber-500/5",
    deltaClass: "text-amber-500",
  },
  reposicao: {
    label: "Reposição",
    icon: <PackagePlus size={13} />,
    iconClass: "border-emerald-400/60 text-emerald-500 bg-emerald-500/5",
    deltaClass: "text-emerald-500",
  },
  devolucao: {
    label: "Devolução",
    icon: <RotateCcw size={13} />,
    iconClass: "border-blue-400/60 text-blue-400 bg-blue-500/5",
    deltaClass: "text-blue-400",
  },
  ajuste: {
    label: "Ajuste manual",
    icon: <SlidersHorizontal size={13} />,
    iconClass: "border-nyx-line text-nyx-muted bg-nyx-cream/10",
    deltaClass: "text-nyx-muted",
  },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? {
    label: type,
    icon: <SlidersHorizontal size={13} />,
    iconClass: "border-nyx-line text-nyx-muted bg-nyx-cream/10",
    deltaClass: "text-nyx-muted",
  };
}

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "venda", label: "Venda" },
  { key: "reposicao", label: "Reposição" },
  { key: "devolucao", label: "Devolução" },
  { key: "ajuste", label: "Ajuste manual" },
];

function fmtDate(iso: string) {
  return iso.split("-").reverse().join("/");
}

interface Props {
  movements: StockMovement[];
}

const COLLAPSED_MAX = 5;

export function StockMovements({ movements }: Props) {
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const filtered = filter === "all" ? movements : movements.filter((m) => m.type === filter);
  const visible = expanded ? filtered : filtered.slice(0, COLLAPSED_MAX);
  const hasMore = filtered.length > COLLAPSED_MAX;

  return (
    <div className="border border-nyx-line">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-nyx-line"
      >
        <div className="flex items-center gap-2">
          <p className="label-mono text-sm text-nyx-ink">Movimentações de estoque</p>
          <span className="label-mono text-[9px] text-nyx-soft">{movements.length} registros</span>
        </div>
        {open ? <ChevronUp size={14} className="text-nyx-muted" /> : <ChevronDown size={14} className="text-nyx-muted" />}
      </button>

      {open && (
        <>
          {/* Filter tabs */}
          <div className="px-5 py-3 border-b border-nyx-line flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => { setFilter(f.key); setExpanded(false); }}
                className={`label-mono text-[9px] px-2.5 py-1 border transition-colors ${
                  filter === f.key
                    ? "border-nyx-ink bg-nyx-ink text-nyx-bg"
                    : "border-nyx-line text-nyx-muted hover:border-nyx-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-xs text-nyx-soft">Nenhuma movimentação encontrada.</p>
            </div>
          ) : (
            <>
              <div className={`divide-y divide-nyx-line ${!expanded && filtered.length > COLLAPSED_MAX ? "max-h-[320px] overflow-y-auto scrollbar-thin" : ""}`}>
                {visible.map((m) => {
                  const cfg = getConfig(m.type);
                  return (
                    <div key={m.id} className="flex items-center gap-4 px-5 py-3">
                      {/* Icon */}
                      <div className={`shrink-0 w-7 h-7 flex items-center justify-center border ${cfg.iconClass}`}>
                        {cfg.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-nyx-ink truncate">{m.productName}</p>
                        <p className="label-mono text-[9px] text-nyx-muted mt-0.5">
                          {SIZE_LABELS[m.size as keyof typeof SIZE_LABELS] ?? m.size}
                          {" · "}
                          {cfg.label}
                          {m.notes && ` · ${m.notes}`}
                        </p>
                      </div>

                      {/* Delta + date */}
                      <div className="text-right shrink-0">
                        <p className={`label-mono text-sm font-medium ${cfg.deltaClass}`}>
                          {m.delta > 0 ? `+${m.delta}` : m.delta}
                        </p>
                        <p className="label-mono text-[9px] text-nyx-soft mt-0.5">{fmtDate(m.date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ver mais / Ver menos */}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setExpanded((p) => !p)}
                  className="w-full flex items-center justify-center gap-1.5 label-mono text-[10px] text-nyx-muted hover:text-nyx-ink py-3 border-t border-nyx-line transition-colors"
                >
                  {expanded ? (
                    <><ChevronUp size={12} /> Ver menos</>
                  ) : (
                    <><ChevronDown size={12} /> Ver mais ({filtered.length - COLLAPSED_MAX} restantes)</>
                  )}
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
