"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { Caixa } from "@/lib/admin-caixa";
import type { Gasto } from "@/lib/admin-gastos";

function fmt(val: number) {
  if (val >= 1000) return `R$${(val / 1000).toFixed(1)}k`;
  return `R$${val.toFixed(0)}`;
}

function fmtFull(val: number) {
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

interface Props {
  caixas: Caixa[];
  gastos: Gasto[];
}

export function DashboardChart({ caixas, gastos }: Props) {
  const monthlyExpenses = gastos
    .filter((g) => g.active && g.frequency === "mensal")
    .reduce((s, g) => s + g.amount, 0);

  const barData = [...caixas]
    .reverse()
    .slice(-20)
    .map((c) => ({
      date: c.date.split("-").slice(1).join("/"),
      faturamento: c.totalGeral,
      gastos: Math.round(monthlyExpenses / 30),
    }));

  if (barData.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center">
        <p className="text-xs text-nyx-soft">Nenhum fechamento de caixa ainda.</p>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={210}>
        <ComposedChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2820" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "#5c5a4f" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#5c5a4f" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmt}
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
            formatter={(value, name) => [
              fmtFull(Number(value ?? 0)),
              name === "faturamento" ? "Faturamento" : "Gasto diário estimado",
            ]}
          />
          <Bar dataKey="faturamento" fill="#ede8d8" radius={[3, 3, 0, 0]} maxBarSize={32} />
          {monthlyExpenses > 0 && (
            <Line
              type="monotone"
              dataKey="gastos"
              stroke="#8c8578"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex gap-5 mt-2">
        <span className="flex items-center gap-1.5 text-[9px] text-nyx-muted">
          <span className="w-2.5 h-2.5 rounded-sm inline-block bg-nyx-ink" />
          Faturamento
        </span>
        {monthlyExpenses > 0 && (
          <span className="flex items-center gap-1.5 text-[9px] text-nyx-muted">
            <span className="w-4 h-px inline-block bg-nyx-muted" style={{ borderTop: "1.5px dashed #8c8578" }} />
            Gasto diário
          </span>
        )}
      </div>
    </div>
  );
}
