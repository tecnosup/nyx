"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { Caixa } from "@/lib/admin-caixa";
import type { Gasto } from "@/lib/admin-gastos";

const COLORS = ["#ede8d8", "#8c8578", "#5c5a4f", "#2a2820", "#6e6a5e"];

const CATEGORY_LABELS: Record<string, string> = {
  aluguel: "Aluguel",
  insumos: "Insumos",
  marketing: "Marketing",
  logistica: "Logística",
  outros: "Outros",
};

function fmt(val: number) {
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Props {
  caixas: Caixa[];
  gastos: Gasto[];
}

export function FinanceiroCharts({ caixas, gastos }: Props) {
  // Bar chart data: last 15 caixas reversed (oldest first)
  const barData = [...caixas].reverse().slice(-15).map((c) => ({
    date: c.date.split("-").slice(1).join("/"), // MM/DD
    total: c.totalGeral,
    pix: c.totalPix,
    cartao: c.totalCard,
  }));

  // Pie chart data: gastos by category (active only)
  const gastosByCategory = gastos
    .filter((g) => g.active)
    .reduce<Record<string, number>>((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + g.amount;
      return acc;
    }, {});

  const pieData = Object.entries(gastosByCategory).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] ?? key,
    value,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      {/* Faturamento por dia */}
      <div className="border border-nyx-line p-5">
        <p className="label-mono text-[10px] text-nyx-muted mb-4">Faturamento por fechamento de caixa</p>
        {barData.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-xs text-nyx-soft">Nenhum fechamento ainda.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8c8578" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8c8578" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ background: "#100f0a", border: "1px solid #2a2820", borderRadius: 0, fontSize: 12 }}
                labelStyle={{ color: "#ede8d8", marginBottom: 4 }}
                itemStyle={{ color: "#8c8578" }}
                formatter={(value) => [fmt(Number(value ?? 0)), ""]}
              />
              <Bar dataKey="pix" name="Pix" fill="#ede8d8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="cartao" name="Cartão" fill="#5c5a4f" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-[10px] text-nyx-muted">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#ede8d8" }} />Pix
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-nyx-muted">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#5c5a4f" }} />Cartão
          </span>
        </div>
      </div>

      {/* Gastos por categoria */}
      <div className="border border-nyx-line p-5">
        <p className="label-mono text-[10px] text-nyx-muted mb-4">Gastos por categoria (ativos)</p>
        {pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-xs text-nyx-soft">Nenhum gasto cadastrado.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#100f0a", border: "1px solid #2a2820", borderRadius: 0, fontSize: 12 }}
                itemStyle={{ color: "#ede8d8" }}
                formatter={(value) => [fmt(Number(value ?? 0)), ""]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10, color: "#8c8578" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
