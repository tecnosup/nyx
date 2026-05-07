"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
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
    const raw = localStorage.getItem("nyx_gasto_dismissals") ?? "[]";
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}

function saveDismissed(set: Set<string>) {
  try { localStorage.setItem("nyx_gasto_dismissals", JSON.stringify([...set])); } catch {}
}

interface ReminderItem {
  gastoId: string;
  description: string;
  dueDate: string;
  daysLeft: number;
  key: string;
}

interface Props {
  gastos: Gasto[];
}

export function GastoReminderBanner({ gastos }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);

  const today = todaySP();

  const reminders: ReminderItem[] = [];
  for (const g of gastos) {
    if (!g.remindRenewal || !g.dueDate || !g.active) continue;
    for (const offset of REMINDER_OFFSETS) {
      const reminderDate = addDays(g.dueDate, -offset);
      if (reminderDate === today) {
        const key = `${g.id}_${reminderDate}`;
        if (!dismissed.has(key)) {
          reminders.push({ gastoId: g.id, description: g.description, dueDate: g.dueDate, daysLeft: offset, key });
        }
      }
    }
  }

  if (reminders.length === 0) return null;

  function dismiss(key: string) {
    const next = new Set(dismissed);
    next.add(key);
    setDismissed(next);
    saveDismissed(next);
  }

  return (
    <div className="space-y-2 mb-8">
      {reminders.map((r) => (
        <div
          key={r.key}
          className="flex items-center justify-between gap-3 border border-amber-400/60 bg-amber-400/5 px-5 py-3.5"
        >
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-600 font-medium truncate">
              {r.daysLeft === 0
                ? <><strong>{r.description}</strong> vence hoje</>
                : r.daysLeft === 3
                ? <><strong>{r.description}</strong> vence em 3 dias</>
                : <><strong>{r.description}</strong> vence em 10 dias</>}
              <span className="ml-2 text-amber-500/70 font-normal text-xs">({fmtBR(r.dueDate)})</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismiss(r.key)}
            className="text-amber-500/70 hover:text-amber-600 transition-colors shrink-0"
            title="Dispensar lembrete"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
