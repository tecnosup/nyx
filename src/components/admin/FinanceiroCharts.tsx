"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import type { Gasto, GastoCategoryItem } from "@/lib/admin-gastos";

const FALLBACK_COLORS = ["#ede8d8", "#8c8578", "#5c5a4f", "#2a2820", "#6e6a5e"];

function fmt(val: number) {
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Props {
  gastos: Gasto[];
  categories: GastoCategoryItem[];
}

export function FinanceiroCharts({ gastos, categories = [] }: Props) {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const gastosByCategory = gastos
    .filter((g) => g.active)
    .reduce<Record<string, number>>((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + g.amount;
      return acc;
    }, {});

  const pieData = Object.entries(gastosByCategory).map(([key, value], i) => ({
    name: catMap[key]?.name ?? key,
    value,
    color: catMap[key]?.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  return (
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
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#100f0a", border: "1px solid #2a2820", borderRadius: 0, fontSize: 12 }}
              itemStyle={{ color: "#ede8d8" }}
              formatter={(value) => [fmt(Number(value ?? 0)), ""]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: "#8c8578" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
