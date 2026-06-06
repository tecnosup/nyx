"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingBag, TrendingUp, Package,
  Layers, Tag, Percent, ClipboardList, Star, Menu, X,
} from "lucide-react";
import { AdminSignOut } from "@/app/admin/(protected)/AdminSignOut";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/financeiro", label: "Financeiro", icon: TrendingUp },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/drops", label: "Drops", icon: Layers },
  { href: "/admin/categorias", label: "Categorias", icon: Tag },
  { href: "/admin/cupons", label: "Cupons", icon: Percent },
  { href: "/admin/auditoria", label: "Auditoria", icon: ClipboardList },
  { href: "/admin/configuracoes", label: "Vitrine", icon: Star },
];

// Bottom nav shows only top 4 items
const BOTTOM_NAV = NAV.slice(0, 4);

export function AdminSidebar({ pendingCount = 0, gastosOverdueCount = 0, gastosUpcomingCount = 0 }: { pendingCount?: number; gastosOverdueCount?: number; gastosUpcomingCount?: number }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 fixed left-0 top-0 h-screen bg-nyx-bg border-r border-nyx-line z-30">
      <div className="h-16 flex items-center px-5 border-b border-nyx-line shrink-0">
        <Link href="/admin" className="heading-display text-lg tracking-tight">
          NYX<span className="text-nyx-muted">.admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          const showPedidosBadge = item.href === "/admin/pedidos" && pendingCount > 0;
          const isFinanceiro = item.href === "/admin/financeiro";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                active
                  ? "bg-nyx-cream text-nyx-ink"
                  : "text-nyx-muted hover:text-nyx-ink hover:bg-nyx-cream/40"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span className="label-mono text-[11px] tracking-wider">{item.label}</span>
              {showPedidosBadge && (
                <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                  {pendingCount}
                </span>
              )}
              {isFinanceiro && (gastosOverdueCount > 0 || gastosUpcomingCount > 0) && (
                <span className="ml-auto flex items-center gap-1">
                  {gastosOverdueCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                      {gastosOverdueCount}
                    </span>
                  )}
                  {gastosUpcomingCount > 0 && (
                    <span className="bg-amber-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                      {gastosUpcomingCount}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-nyx-line">
        <AdminSignOut />
      </div>
    </aside>
  );
}

export function AdminBottomNav({ pendingCount = 0, gastosOverdueCount = 0, gastosUpcomingCount = 0 }: { pendingCount?: number; gastosOverdueCount?: number; gastosUpcomingCount?: number }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-64 z-50 bg-nyx-bg border-r border-nyx-line flex flex-col transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-nyx-line shrink-0">
          <Link href="/admin" className="heading-display text-lg tracking-tight" onClick={() => setDrawerOpen(false)}>
            NYX<span className="text-nyx-muted">.admin</span>
          </Link>
          <button onClick={() => setDrawerOpen(false)} className="text-nyx-muted hover:text-nyx-ink transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            const showPedidosBadge = item.href === "/admin/pedidos" && pendingCount > 0;
            const isFinanceiro = item.href === "/admin/financeiro";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                  active
                    ? "bg-nyx-cream text-nyx-ink"
                    : "text-nyx-muted hover:text-nyx-ink hover:bg-nyx-cream/40"
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span className="label-mono text-[11px] tracking-wider">{item.label}</span>
                {showPedidosBadge && (
                  <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                    {pendingCount}
                  </span>
                )}
                {isFinanceiro && (gastosOverdueCount > 0 || gastosUpcomingCount > 0) && (
                  <span className="ml-auto flex items-center gap-1">
                    {gastosOverdueCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                        {gastosOverdueCount}
                      </span>
                    )}
                    {gastosUpcomingCount > 0 && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                        {gastosUpcomingCount}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-nyx-line">
          <AdminSignOut />
        </div>
      </aside>

      {/* Bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-nyx-bg border-t border-nyx-line flex">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          const showPedidosBadge = item.href === "/admin/pedidos" && pendingCount > 0;
          const isFinanceiro = item.href === "/admin/financeiro";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${
                active ? "text-nyx-ink" : "text-nyx-soft"
              }`}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={1.5} />
                {showPedidosBadge && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[8px] font-bold min-w-[14px] h-3.5 rounded-full flex items-center justify-center px-0.5">
                    {pendingCount}
                  </span>
                )}
                {isFinanceiro && gastosOverdueCount > 0 && (
                  <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[8px] font-bold min-w-[14px] h-3.5 rounded-full flex items-center justify-center px-0.5">
                    {gastosOverdueCount}
                  </span>
                )}
                {isFinanceiro && gastosUpcomingCount > 0 && gastosOverdueCount === 0 && (
                  <span className="absolute -top-1 -right-3 bg-amber-500 text-white text-[8px] font-bold min-w-[14px] h-3.5 rounded-full flex items-center justify-center px-0.5">
                    {gastosUpcomingCount}
                  </span>
                )}
              </span>
              <span className="label-mono text-[9px] tracking-wider">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors text-nyx-soft hover:text-nyx-ink"
        >
          <Menu size={20} strokeWidth={1.5} />
          <span className="label-mono text-[9px] tracking-wider">Menu</span>
        </button>
      </nav>
    </>
  );
}

// Keep AdminNav export for backward compat (unused after layout change)
export function AdminNav() {
  return null;
}
