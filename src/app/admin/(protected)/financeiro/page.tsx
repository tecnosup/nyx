import { adminListGastos, adminGastoStats, adminListGastoCategories } from "@/lib/admin-gastos";
import { adminListCaixas, adminGetOpenCaixaDates } from "@/lib/admin-caixa";
import { adminListOrders, adminOrderStats } from "@/lib/admin-orders";
import { listProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { GastosManager } from "@/components/admin/GastosManager";
import { FinanceiroCharts } from "@/components/admin/FinanceiroCharts";
import { DashboardChart } from "@/components/admin/DashboardChart";
import { GastoReminderBanner } from "@/components/admin/GastoReminderBanner";
import { CaixaSection } from "@/components/admin/CaixaSection";
import { CaixaHistoryList } from "@/components/admin/CaixaHistoryList";
import { OpenCaixaBanner } from "@/components/admin/OpenCaixaBanner";

export const dynamic = "force-dynamic";


const FREQUENCY_LABELS: Record<string, string> = {
  mensal: "Mensal",
  semanal: "Semanal",
  avulso: "Avulso",
};

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ caixaDate?: string }>;
}) {
  const { caixaDate } = await searchParams;

  const [gastos, gastoStats, caixas, orderStats, gastoCategories, orders, products, openCaixaDates] = await Promise.all([
    adminListGastos(),
    adminGastoStats(),
    adminListCaixas(),
    adminOrderStats(),
    adminListGastoCategories().catch(() => [] as Awaited<ReturnType<typeof adminListGastoCategories>>),
    adminListOrders(200).catch(() => []),
    listProducts().catch(() => []),
    adminGetOpenCaixaDates(),
  ]);

  const openCaixaOrders = orders.filter((o) => o.status === "completed" && !o.caixaId);

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

      <OpenCaixaBanner dates={openCaixaDates} />
      <GastoReminderBanner gastos={gastos} />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Kpi label="Faturamento este mês" value={formatPrice(revenueThisMonth)} />
        <Kpi label="Gastos recorrentes/mês" value={formatPrice(gastoStats.monthlyTotal)} />
        <Kpi label="Lucro estimado" value={formatPrice(lucroEstimado)} highlight={lucroEstimado > 0} />
        <Kpi label="Receita total (pedidos)" value={formatPrice(orderStats.revenuePix)} />
      </div>

      {/* Faturamento por fechamento de caixa */}
      <div className="border border-nyx-line p-5 mb-4">
        <p className="label-mono text-[10px] text-nyx-muted mb-4">Faturamento por fechamento de caixa</p>
        <DashboardChart caixas={caixas} gastos={gastos} />
      </div>

      {/* Agenda */}
      <section id="agenda-caixa" className="mb-12 scroll-mt-6">
        <CaixaSection
          caixas={caixas}
          pendingCount={openCaixaOrders.length}
          openOrders={openCaixaOrders}
          products={products}
          gastos={gastos}
          isFinanceiro
          gastoCategories={gastoCategories}
          initialSelectedDate={caixaDate}
        />
      </section>

      {/* Gastos por categoria + Fechamentos de caixa */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <FinanceiroCharts gastos={gastos} categories={gastoCategories} />
        <div className="border border-nyx-line">
          <div className="px-5 py-4 border-b border-nyx-line">
            <p className="label-mono text-[10px] text-nyx-muted">Fechamentos de caixa</p>
          </div>
          {caixas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="label-mono text-nyx-muted text-xs">Nenhum fechamento ainda.</p>
            </div>
          ) : (
            <CaixaHistoryList caixas={caixas} />
          )}
        </div>
      </div>

      {/* Gastos */}
      <section className="mb-16">
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
