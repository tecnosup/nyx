"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { Caixa } from "@/lib/admin-caixa";
import type { Gasto } from "@/lib/admin-gastos";

function fmtShort(val: number) {
  if (val >= 1000) return `R$${(val / 1000).toFixed(1)}k`;
  return `R$${val.toFixed(0)}`;
}

function fmtFull(val: number) {
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

const PERIODS = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Este mês", value: "month" },
  { label: "Todo período", value: "all" },
] as const;

type Period = (typeof PERIODS)[number]["value"];

interface Props {
  caixas: Caixa[];
  gastos: Gasto[];
}

function getPeriodRange(period: Period): { start: string; end: string } | null {
  const now = new Date();
  const toISO = (d: Date) => d.toISOString().split("T")[0];

  if (period === "7d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { start: toISO(start), end: toISO(now) };
  }
  if (period === "30d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    return { start: toISO(start), end: toISO(now) };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: toISO(start), end: toISO(now) };
  }
  return null; // all
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

export function DashboardChart({ caixas, gastos }: Props) {
  const [period, setPeriod] = useState<Period>("all");
  const [showBruto, setShowBruto] = useState(true);
  const [showLiquido, setShowLiquido] = useState(true);
  const [showDespesas, setShowDespesas] = useState(true);

  const monthlyExpenses = gastos
    .filter((g) => g.active && g.frequency === "mensal")
    .reduce((s, g) => s + g.amount, 0);

  const dailyExpenses = monthlyExpenses / 30;

  const chartData = useMemo(() => {
    const range = getPeriodRange(period);

    const filtered = range
      ? caixas.filter((c) => c.date >= range.start && c.date <= range.end)
      : caixas;

    if (filtered.length === 0) return [];

    // Group by date
    const byDate: Record<string, number> = {};
    for (const c of filtered) {
      byDate[c.date] = (byDate[c.date] || 0) + c.totalGeral;
    }

    const sorted = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));

    // If more than 31 days, group by month instead
    const totalDays = range
      ? daysBetween(range.start, range.end)
      : sorted.length > 0
        ? daysBetween(sorted[0][0], sorted[sorted.length - 1][0])
        : 1;

    if (totalDays > 31) {
      const byMonth: Record<string, number> = {};
      for (const [date, total] of sorted) {
        const key = date.slice(0, 7); // YYYY-MM
        byMonth[key] = (byMonth[key] || 0) + total;
      }
      return Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, bruto]) => {
          const [, m] = key.split("-");
          const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
          const despesas = monthlyExpenses;
          return {
            label: MONTHS[parseInt(m, 10) - 1],
            bruto,
            liquido: Math.max(0, bruto - despesas),
            despesas,
          };
        });
    }

    // Group by day
    return sorted.map(([date, bruto]) => {
      const [, m, d] = date.split("-");
      const despesas = dailyExpenses;
      return {
        label: `${d}/${m}`,
        bruto,
        liquido: Math.max(0, bruto - despesas),
        despesas,
      };
    });
  }, [caixas, period, monthlyExpenses, dailyExpenses]);

  // Summary stats always over full history
  const allBruto = caixas.reduce((s, c) => s + c.totalGeral, 0);

  const bestCaixa = caixas.reduce(
    (best, c) => (c.totalGeral > best.totalGeral ? c : best),
    { date: "", totalGeral: 0 } as { date: string; totalGeral: number }
  );
  const bestLabel = bestCaixa.date
    ? (() => { const [, m, d] = bestCaixa.date.split("-"); return `${d}/${m}`; })()
    : "";

  if (caixas.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center gap-2">
        <p className="text-xs text-nyx-soft">Nenhum fechamento de caixa ainda.</p>
        <p className="text-[10px] text-nyx-soft/60">Feche o caixa em Pedidos para ver o gráfico.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Period filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`label-mono text-[9px] tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
              period === p.value
                ? "bg-nyx-ink text-nyx-bg border-nyx-ink"
                : "border-nyx-line text-nyx-muted hover:border-nyx-soft hover:text-nyx-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary — sempre todo o período */}
      <div className="mb-5">
        <p className="label-mono text-[9px] text-nyx-muted mb-1">Receita acumulada</p>
        <p className="heading-display text-2xl md:text-3xl text-nyx-ink">{fmtFull(allBruto)}</p>
        <div className="flex flex-wrap gap-x-4 mt-1">
          {bestCaixa.totalGeral > 0 && (
            <p className="text-[10px] text-nyx-muted">
              Melhor dia: <span className="text-nyx-soft">{bestLabel}</span> · {fmtFull(bestCaixa.totalGeral)}
            </p>
          )}
          {monthlyExpenses > 0 && (
            <p className="text-[10px] text-red-400">
              Gastos registrados: {fmtFull(monthlyExpenses)}
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-nyx-soft">Sem dados para o período selecionado.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBruto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a847" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#d4a847" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradLiquido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2820" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#5c5a4f" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#5c5a4f" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtShort}
            />
            <Tooltip
              contentStyle={{
                background: "#161410",
                border: "1px solid #2a2820",
                borderRadius: 0,
                fontSize: 11,
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#ede8d8", marginBottom: 4, fontSize: 10 }}
              itemStyle={{ color: "#8c8578" }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  bruto: "Faturamento Bruto",
                  liquido: "Faturamento Líquido",
                  despesas: "Despesas",
                };
                return [fmtFull(Number(value ?? 0)), labels[name as string] ?? name];
              }}
            />
            {showBruto && (
              <Area
                type="monotone"
                dataKey="bruto"
                stroke="#d4a847"
                strokeWidth={1.5}
                fill="url(#gradBruto)"
                dot={false}
                activeDot={{ r: 3, fill: "#d4a847", stroke: "#100f0a", strokeWidth: 2 }}
              />
            )}
            {showLiquido && (
              <Area
                type="monotone"
                dataKey="liquido"
                stroke="#4ade80"
                strokeWidth={1.5}
                fill="url(#gradLiquido)"
                dot={false}
                activeDot={{ r: 3, fill: "#4ade80", stroke: "#100f0a", strokeWidth: 2 }}
              />
            )}
            {showDespesas && (
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="#f97316"
                strokeWidth={1.5}
                fill="url(#gradDespesas)"
                dot={false}
                activeDot={{ r: 3, fill: "#f97316", stroke: "#100f0a", strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Toggles */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => setShowBruto((v) => !v)}
          className={`flex items-center gap-1.5 label-mono text-[9px] tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
            showBruto
              ? "border-[#d4a847] text-[#d4a847] bg-[#d4a847]/10"
              : "border-nyx-line text-nyx-soft opacity-50"
          }`}
        >
          <span className="w-3 h-0.5 rounded-full bg-current inline-block" />
          Faturamento Bruto
        </button>
        <button
          onClick={() => setShowLiquido((v) => !v)}
          className={`flex items-center gap-1.5 label-mono text-[9px] tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
            showLiquido
              ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10"
              : "border-nyx-line text-nyx-soft opacity-50"
          }`}
        >
          <span className="w-3 h-0.5 rounded-full bg-current inline-block" />
          Faturamento Líquido
        </button>
        <button
          onClick={() => setShowDespesas((v) => !v)}
          className={`flex items-center gap-1.5 label-mono text-[9px] tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
            showDespesas
              ? "border-[#f97316] text-[#f97316] bg-[#f97316]/10"
              : "border-nyx-line text-nyx-soft opacity-50"
          }`}
        >
          <span className="w-3 h-0.5 rounded-full bg-current inline-block" />
          Despesas
        </button>
      </div>
    </div>
  );
}
