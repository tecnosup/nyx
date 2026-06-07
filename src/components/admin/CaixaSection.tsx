"use client";

import { CaixaCalendar } from "@/components/admin/CaixaCalendar";
import type { Caixa } from "@/lib/admin-caixa";
import type { Order } from "@/lib/admin-orders";
import type { Product } from "@/lib/types";
import type { Gasto, GastoCategoryItem } from "@/lib/admin-gastos";

interface Props {
  caixas: Caixa[];
  pendingCount: number;
  openOrders: Order[];
  products: Product[];
  gastos?: Gasto[];
  isFinanceiro?: boolean;
  gastoCategories?: GastoCategoryItem[];
  initialSelectedDate?: string;
}

export function CaixaSection({ caixas, openOrders, products, gastos, isFinanceiro, gastoCategories, initialSelectedDate }: Props) {
  return <CaixaCalendar caixas={caixas} openOrders={openOrders} products={products} gastos={gastos} isFinanceiro={isFinanceiro} gastoCategories={gastoCategories} initialSelectedDate={initialSelectedDate} />;
}
