"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, X, CheckCircle, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { resolveGastoRenewalAction } from "@/app/admin/(protected)/financeiro/actions";
import type { Gasto } from "@/lib/admin-gastos";

const REMINDER_OFFSETS = [10, 3, 0]; // dias antes do vencimento

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
  try {
    return new Set(JSON.parse(localStorage.getItem("nyx_gasto_dismissals") ?? "[]") as string[]);
  } catch { return new Set(); }
}

function saveDismissed(set: Set<string>) {
  try { localStorage.setItem("nyx_gasto_dismissals", JSON.stringify([...set])); } catch {}
}

interface ReminderItem {
  gasto: Gasto;
  daysLeft: number; // 10, 3, 0 = no dia; negativo = vencido
  key: string;
}

interface Props {
  gastos: Gasto[];
}

export function GastoReminderBanner({ gastos }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);
  const [confirming, setConfirming] = useState<ReminderItem | null>(null);
  const [newAmount, setNewAmount] = useState("");
  const [pending, startTransition] = useTransition();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const today = todaySP();

  // Reminders: dias específicos (10d, 3d, 0d antes) + vencidos
  const reminders: ReminderItem[] = [];
  for (const g of gastos) {
    if (!g.remindRenewal || !g.dueDate || !g.active) continue;
    if (resolved.has(g.id)) continue;

    // Vencido (passou da data)
    if (g.dueDate < today) {
      const key = `${g.id}_overdue_${today}`;
      if (!dismissed.has(key)) {
        const diffMs = new Date(today).getTime() - new Date(g.dueDate).getTime();
        const daysOverdue = Math.floor(diffMs / 86400000);
        reminders.push({ gasto: g, daysLeft: -daysOverdue, key });
      }
      continue;
    }

    // Dias de lembrete (10d, 3d, no dia)
    for (const offset of REMINDER_OFFSETS) {
      const reminderDate = addDays(g.dueDate, -offset);
      if (reminderDate === today) {
        const key = `${g.id}_${reminderDate}`;
        if (!dismissed.has(key)) {
          reminders.push({ gasto: g, daysLeft: offset, key });
        }
      }
    }
  }

  if (reminders.length === 0 && !confirming) return null;

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
    startTransition(async () => {
      await resolveGastoRenewalAction(
        confirming.gasto.id,
        amt !== confirming.gasto.amount ? amt : undefined
      );
      setResolved((prev) => new Set([...prev, confirming.gasto.id]));
      // Dismiss the key too so it won't reappear today
      dismiss(confirming.key);
      setConfirming(null);
    });
  }

  function reminderText(r: ReminderItem) {
    if (r.daysLeft < 0) return `venceu há ${Math.abs(r.daysLeft)} dia${Math.abs(r.daysLeft) !== 1 ? "s" : ""}`;
    if (r.daysLeft === 0) return "vence hoje";
    if (r.daysLeft === 3) return "vence em 3 dias";
    return "vence em 10 dias";
  }

  const isOverdueOrToday = (r: ReminderItem) => r.daysLeft <= 0;

  return (
    <>
      <div className="space-y-2 mb-8">
        {reminders.map((r) => (
          <div
            key={r.key}
            className={`flex items-center justify-between gap-3 border px-5 py-3.5 ${
              r.daysLeft < 0
                ? "border-red-500/60 bg-red-500/5"
                : "border-amber-400/60 bg-amber-400/5"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <AlertTriangle
                size={16}
                className={`shrink-0 ${r.daysLeft < 0 ? "text-red-500" : "text-amber-500"}`}
              />
              <p className={`text-sm font-medium truncate ${r.daysLeft < 0 ? "text-red-500" : "text-amber-600"}`}>
                <strong>{r.gasto.description}</strong> {reminderText(r)}
                <span className={`ml-2 font-normal text-xs ${r.daysLeft < 0 ? "text-red-400/70" : "text-amber-500/70"}`}>
                  ({fmtBR(r.gasto.dueDate!)}) · {formatPrice(r.gasto.amount)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isOverdueOrToday(r) && (
                <button
                  type="button"
                  onClick={() => openConfirm(r)}
                  className="inline-flex items-center gap-1 label-mono text-[10px] px-3 py-1.5 border border-emerald-500/60 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  <CheckCircle size={11} />
                  Marcar como pago
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(r.key)}
                className={`transition-colors ${r.daysLeft < 0 ? "text-red-400/70 hover:text-red-500" : "text-amber-500/70 hover:text-amber-600"}`}
                title="Dispensar lembrete"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmação */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => !pending && setConfirming(null)} />
          <div className="relative z-10 w-full max-w-sm bg-nyx-bg border border-nyx-line p-6 space-y-5">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-nyx-ink">
                  Confirmar pagamento
                </p>
                <p className="text-xs text-nyx-muted mt-1">
                  {confirming.gasto.description} · vencimento {fmtBR(confirming.gasto.dueDate!)}
                </p>
              </div>
            </div>

            {/* Edição de valor apenas se vencido */}
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
