import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminAutoCloseStaleCaixas } from "@/lib/admin-caixa";

export const dynamic = "force-dynamic";

// Vercel Cron chama esta rota todo dia às 23:59 (America/Sao_Paulo).
// Fecha automaticamente o caixa de qualquer dia anterior que ainda tenha
// vendas concluídas sem fechamento — o admin só precisa fechar manualmente
// quando quiser revisar o dia antes da virada.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const closed = await adminAutoCloseStaleCaixas();

  if (closed.length > 0) {
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/financeiro");
    revalidatePath("/admin");
  }

  return NextResponse.json({ ok: true, closed });
}
