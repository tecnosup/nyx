import { adminListGastos, adminGastoStats, adminListGastoCategories } from "@/lib/admin-gastos";
import { adminListCaixas } from "@/lib/admin-caixa";
import { adminOrderStats } from "@/lib/admin-orders";
import { formatPrice } from "@/lib/utils";
import { GastosManager } from "@/components/admin/GastosManager";
import { FinanceiroCharts } from "@/components/admin/FinanceiroCharts";
import { DashboardChart } from "@/components/admin/DashboardChart";

export const dynamic = "force-dynamic";


const FREQUENCY_LABELS: Record<string, string> = {
  mensal: "Mensal",
  semanal: "Semanal",
  avulso: "Avulso",
};

export default async function FinanceiroPage() {
  const [gastos, gastoStats, caixas, orderStats, gastoCategories] = await Promise.all([
    adminListGastos(),
    adminGastoStats(),
    adminListCaixas(30),
    adminOrderStats(),
    adminListGastoCategories().catch(() => [] as Awaited<ReturnType<typeof adminListGastoCategories>>),
  ]);

  // Faturamento do mês atual (a partir dos caixas)
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const caixasThisMonth = caixas.filter((c) => c.date.startsWith(currentMonthPrefix));
  const revenueThisMonth = caixasThisMonth.reduce((s, c) => s + c.totalGeral, 0);

  const lucroEstimado = revenueThisMonth - gastoStats.monthlyTotal;

  return (
    <div className="container-nyx py-12 md:py-16">
      <div className="mb-10">
        <h1 className="heading-display text-3xl md:text-4xl">Financeiro</h1>
        <p className="text-sm text-nyx-muted mt-1">
          Visão geral de faturamento, gastos e lucro estimado.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Kpi label="Faturamento este mês" value={formatPrice(revenueThisMonth)} />
        <Kpi label="Gastos recorrentes/mês" value={formatPrice(gastoStats.monthlyTotal)} />
        <Kpi label="Lucro estimado" value={formatPrice(lucroEstimado)} highlight={lucroEstimado > 0} />
        <Kpi label="Receita total (pedidos)" value={formatPrice(orderStats.revenuePix)} />
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-[1fr_320px] gap-4 mb-12">
        <div className="border border-nyx-line p-5">
          <p className="label-mono text-[10px] text-nyx-muted mb-4">Faturamento por fechamento de caixa</p>
          <DashboardChart caixas={caixas} gastos={gastos} />
        </div>
        <FinanceiroCharts gastos={gastos} categories={gastoCategories} />
      </div>

      {/* Histórico de caixas */}
      <section className="mb-16">
        <div className="border border-nyx-line">
          <div className="flex items-center justify-between px-5 py-4 border-b border-nyx-line">
            <h2 className="heading-display text-xl">Fechamentos de caixa</h2>
            <span className="label-mono text-[9px] text-nyx-soft">{caixas.length} fechamento{caixas.length !== 1 ? "s" : ""}</span>
          </div>
          {caixas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="label-mono text-nyx-muted text-xs">Nenhum fechamento ainda.</p>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto scrollbar-thin divide-y divide-nyx-line">
              {caixas.map((c) => (
                <div key={c.id} className="px-5 py-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm items-center">
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Data</p>
                    <p className="text-nyx-ink">{c.date.split("-").reverse().join("/")}</p>
                  </div>
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Pedidos</p>
                    <p className="text-nyx-ink">{c.orderCount}</p>
                  </div>
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Pix</p>
                    <p className="text-nyx-ink">{formatPrice(c.totalPix)}</p>
                  </div>
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Cartão</p>
                    <p className="text-nyx-ink">{formatPrice(c.totalCard)}</p>
                  </div>
                  <div>
                    <p className="label-mono text-[9px] text-nyx-muted mb-0.5">Total</p>
                    <p className="text-nyx-ink font-medium">{formatPrice(c.totalGeral)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gastos */}
      <section>
        <GastosManager
          gastos={gastos}
          categories={gastoCategories}
          frequencyLabels={FREQUENCY_LABELS}
        />
      </section>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border p-5 ${highlight ? "border-emerald-400 bg-emerald-50/10" : "border-nyx-line"}`}>
      <p className="label-mono text-[10px] text-nyx-muted mb-1">{label}</p>
      <p className={`font-serif text-2xl ${highlight ? "text-emerald-600" : "text-nyx-ink"}`}>{value}</p>
    </div>
  );
}
