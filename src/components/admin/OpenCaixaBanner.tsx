"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

function fmtDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const label = date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
  return label.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OpenCaixaBanner({ dates }: { dates: string[] }) {
  if (dates.length === 0) return null;

  return (
    <div className="border border-red-500/40 bg-red-500/5 rounded-sm px-4 py-3 mb-2 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-red-400 shrink-0">
        <AlertTriangle size={15} />
        <span className="text-sm font-medium">
          {dates.length} caixa{dates.length > 1 ? "s" : ""} retroativo{dates.length > 1 ? "s" : ""} em aberto
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {dates.map((d) => (
          <Link
            key={d}
            href={`/admin/financeiro?caixaDate=${d}#agenda-caixa`}
            className="label-mono text-[10px] px-2.5 py-1 border border-red-400/40 text-red-300 hover:bg-red-500/15 hover:border-red-400/70 transition-colors"
          >
            {fmtDayLabel(d)}
          </Link>
        ))}
      </div>
    </div>
  );
}
