"use client";

import { CaixaCalendar } from "@/components/admin/CaixaCalendar";
import type { Caixa } from "@/lib/admin-caixa";
import type { Order } from "@/lib/admin-orders";
import type { Product } from "@/lib/types";
import type { Gasto } from "@/lib/admin-gastos";

interface Props {
  caixas: Caixa[];
  pendingCount: number;
  openOrders: Order[];
  products: Product[];
  gastos?: Gasto[];
}

export function CaixaSection({ caixas, openOrders, products, gastos }: Props) {
  return <CaixaCalendar caixas={caixas} openOrders={openOrders} products={products} gastos={gastos} />;
}
