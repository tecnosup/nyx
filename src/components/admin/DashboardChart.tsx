"use client";

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

const MONTH_NAMES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

interface Props {
  caixas: Caixa[];
  gastos: Gasto[];
}

export function DashboardChart({ caixas, gastos }: Props) {
  const monthlyExpenses = gastos
    .filter((g) => g.active && g.frequency === "mensal")
    .reduce((s, g) => s + g.amount, 0);

  // Group by month
  const byMonth: Record<string, number> = {};
  for (const c of caixas) {
    const [year, month] = c.date.split("-");
    const key = `${year}-${month}`;
    byMonth[key] = (byMonth[key] || 0) + c.totalGeral;
  }

  const monthData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, total]) => ({
      label: MONTH_NAMES[parseInt(key.split("-")[1], 10) - 1],
      total,
    }));

  // Summary stats
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthRevenue = byMonth[currentKey] || 0;

  const bestMonth = Object.entries(byMonth).reduce(
    (best, [key, total]) => (total > best.total ? { key, total } : best),
    { key: "", total: 0 }
  );
  const bestMonthName = bestMonth.key
    ? MONTH_NAMES[parseInt(bestMonth.key.split("-")[1], 10) - 1]
    : null;

  if (monthData.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center gap-2">
        <p className="text-xs text-nyx-soft">Nenhum fechamento de caixa ainda.</p>
        <p className="text-[10px] text-nyx-soft/60">Feche o caixa em Pedidos para ver o gráfico.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4">
        <div>
          <p className="label-mono text-[9px] text-nyx-muted mb-1">Receita acumulada</p>
          <p className="heading-display text-2xl md:text-3xl text-nyx-ink">
            {fmtFull(currentMonthRevenue)}
          </p>
          {bestMonthName && bestMonth.total > 0 && (
            <p className="text-[10px] text-nyx-muted mt-1">
              Melhor mês: <span className="text-nyx-soft capitalize">{bestMonthName}</span>
              {" · "}{fmtFull(bestMonth.total)}
            </p>
          )}
        </div>
        {monthlyExpenses > 0 && (
          <div className="sm:text-right shrink-0">
            <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Gastos/mês</p>
            <p className="text-sm text-nyx-soft">{fmtFull(monthlyExpenses)}</p>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={monthData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ede8d8" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#ede8d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2820" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#5c5a4f" }}
            axisLine={false}
            tickLine={false}
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
            labelStyle={{ color: "#ede8d8", marginBottom: 4, fontSize: 10, textTransform: "capitalize" }}
            itemStyle={{ color: "#8c8578" }}
            formatter={(value) => [fmtFull(Number(value ?? 0)), "Faturamento"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#ede8d8"
            strokeWidth={1.5}
            fill="url(#gradFat)"
            dot={false}
            activeDot={{ r: 3, fill: "#ede8d8", stroke: "#100f0a", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
