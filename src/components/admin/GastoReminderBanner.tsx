"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Bell, ChevronDown, CheckCircle, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { resolveGastoRenewalAction } from "@/app/admin/(protected)/financeiro/actions";
import type { Gasto } from "@/lib/admin-gastos";

const REMINDER_OFFSETS = [10, 3, 0];

function todaySP(): string {
  return new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split("/").reverse().join("-");
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fmtBR(iso: string) {
  return iso.split("-").reverse().join("/");
}

function loadDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem("nyx_gasto_dismissals") ?? "[]") as string[]); }
  catch { return new Set(); }
}

function saveDismissed(set: Set<string>) {
  try { localStorage.setItem("nyx_gasto_dismissals", JSON.stringify([...set])); } catch {}
}

interface ReminderItem {
  gasto: Gasto;
  daysLeft: number;
  key: string;
}

interface Props { gastos: Gasto[] }

function daysLeftLabel(daysLeft: number): string {
  if (daysLeft < 0) return `Venceu há ${Math.abs(daysLeft)} dia${Math.abs(daysLeft) !== 1 ? "s" : ""}`;
  if (daysLeft === 0) return "Vence hoje";
  return `Vence em ${daysLeft}d`;
}

function CollapsibleCard({
  icon,
  title,
  count,
  borderCls,
  headerCls,
  defaultOpen = true,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  borderCls: string;
  headerCls: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-sm overflow-hidden ${borderCls}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 ${headerCls} transition-colors`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{count} {title}</span>
        </div>
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="divide-y divide-white/5">{children}</div>}
    </div>
  );
}

export function GastoReminderBanner({ gastos }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);
  const [confirming, setConfirming] = useState<ReminderItem | null>(null);
  const [newAmount, setNewAmount] = useState("");
  const [pending, startTransition] = useTransition();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const today = todaySP();

  const reminders: ReminderItem[] = [];
  for (const g of gastos) {
    if (!g.remindRenewal || !g.dueDate || !g.active) continue;
    if (resolved.has(g.id)) continue;

    if (g.dueDate < today) {
      const key = `${g.id}_overdue_${today}`;
      if (!dismissed.has(key)) {
        const daysOverdue = Math.floor((new Date(today).getTime() - new Date(g.dueDate).getTime()) / 86400000);
        reminders.push({ gasto: g, daysLeft: -daysOverdue, key });
      }
      continue;
    }

    for (const offset of REMINDER_OFFSETS) {
      const reminderDate = addDays(g.dueDate, -offset);
      if (reminderDate === today) {
        const key = `${g.id}_${reminderDate}`;
        if (!dismissed.has(key)) reminders.push({ gasto: g, daysLeft: offset, key });
      }
    }
  }

  if (reminders.length === 0 && !confirming) return null;

  const overdue = reminders.filter((r) => r.daysLeft < 0);
  const upcoming = reminders.filter((r) => r.daysLeft >= 0);

  function dismiss(key: string) {
    const next = new Set(dismissed);
    next.add(key);
    setDismissed(next);
    saveDismissed(next);
  }

  function openConfirm(item: ReminderItem) {
    setNewAmount(String(item.gasto.amount));
    setConfirming(item);
  }

  function confirmPay() {
    if (!confirming) return;
    const amt = parseFloat(newAmount);
    const snap = confirming;
    startTransition(async () => {
      try {
        await resolveGastoRenewalAction(snap.gasto.id, amt !== snap.gasto.amount ? amt : undefined);
        setResolved((prev) => new Set([...prev, snap.gasto.id]));
        dismiss(snap.key);
      } catch {}
      finally { setConfirming(null); }
    });
  }

  return (
    <>
      <div className="space-y-2 mb-8">

        {/* Vencidos */}
        {overdue.length > 0 && (
          <CollapsibleCard
            icon={<AlertTriangle size={15} className="text-red-400 shrink-0" />}
            title={`vencimento${overdue.length > 1 ? "s" : ""} em atraso`}
            count={overdue.length}
            borderCls="border-red-500/40"
            headerCls="bg-red-500/10 text-red-400 hover:bg-red-500/15"
            defaultOpen={true}
          >
            {overdue.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3 px-4 py-3 bg-red-500/5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-nyx-ink font-medium truncate">{r.gasto.description}</p>
                  <p className="text-[10px] text-red-400 mt-0.5">
                    {daysLeftLabel(r.daysLeft)} · {fmtBR(r.gasto.dueDate!)} · {formatPrice(r.gasto.amount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openConfirm(r)}
                  className="shrink-0 inline-flex items-center gap-1 label-mono text-[9px] px-2.5 py-1.5 border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors whitespace-nowrap"
                >
                  <CheckCircle size={11} />
                  Confirmar
                </button>
              </div>
            ))}
          </CollapsibleCard>
        )}

        {/* Próximos vencimentos */}
        {upcoming.length > 0 && (
          <CollapsibleCard
            icon={<Bell size={15} className="text-amber-400 shrink-0" />}
            title={`vencimento${upcoming.length > 1 ? "s" : ""} próximo${upcoming.length > 1 ? "s" : ""}`}
            count={upcoming.length}
            borderCls="border-amber-400/40"
            headerCls="bg-amber-400/10 text-amber-400 hover:bg-amber-400/15"
            defaultOpen={upcoming.length <= 2}
          >
            {upcoming.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-400/5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-nyx-ink font-medium truncate">{r.gasto.description}</p>
                  <p className="text-[10px] text-amber-400/80 mt-0.5">
                    {daysLeftLabel(r.daysLeft)} · {fmtBR(r.gasto.dueDate!)} · {formatPrice(r.gasto.amount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openConfirm(r)}
                  className="shrink-0 inline-flex items-center gap-1 label-mono text-[9px] px-2.5 py-1.5 border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors whitespace-nowrap"
                >
                  <CheckCircle size={11} />
                  Confirmar
                </button>
              </div>
            ))}
          </CollapsibleCard>
        )}
      </div>

      {/* Modal de confirmação */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirming(null)} />
          <div className="relative z-10 w-full max-w-sm bg-nyx-bg border border-nyx-line p-6 space-y-5">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-nyx-ink">Confirmar pagamento</p>
                <p className="text-xs text-nyx-muted mt-1">
                  {confirming.gasto.description} · vencimento {fmtBR(confirming.gasto.dueDate!)}
                </p>
              </div>
            </div>

            {confirming.daysLeft < 0 && (
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">
                  Valor pago (edite se houver juros/multa)
                </label>
                <input
                  type="number"
                  className="input-nyx"
                  step="0.01"
                  min="0"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
                {parseFloat(newAmount) !== confirming.gasto.amount && parseFloat(newAmount) > 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    Valor original: {formatPrice(confirming.gasto.amount)} · Diferença: {formatPrice(parseFloat(newAmount) - confirming.gasto.amount)}
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-nyx-muted">
              O próximo vencimento será atualizado automaticamente para o próximo ciclo.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirming(null)}
                className="label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmPay}
                className="inline-flex items-center gap-1.5 label-mono text-xs px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <ChevronRight size={13} />
                {pending ? "Salvando…" : "Confirmar pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
