"use client";

import { CaixaCalendar } from "@/components/admin/CaixaCalendar";
import type { Caixa } from "@/lib/admin-caixa";
import type { Order } from "@/lib/admin-orders";
import type { Product } from "@/lib/types";

interface Props {
  caixas: Caixa[];
  pendingCount: number;
  openOrders: Order[];
  products: Product[];
}

export function CaixaSection({ caixas, openOrders, products }: Props) {
  return <CaixaCalendar caixas={caixas} openOrders={openOrders} products={products} />;
}
