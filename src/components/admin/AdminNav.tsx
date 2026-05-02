"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, TrendingUp, Package,
  Layers, Tag, ClipboardList, Settings, LogOut, MoreHorizontal,
} from "lucide-react";
import { AdminSignOut } from "@/app/admin/(protected)/AdminSignOut";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/financeiro", label: "Financeiro", icon: TrendingUp },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/drops", label: "Drops", icon: Layers },
  { href: "/admin/categorias", label: "Categorias", icon: Tag },
  { href: "/admin/cupons", label: "Cupons", icon: Tag },
  { href: "/admin/auditoria", label: "Auditoria", icon: ClipboardList },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

// Bottom nav shows only top 4 items
const BOTTOM_NAV = NAV.slice(0, 4);

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 min-h-screen bg-nyx-bg border-r border-nyx-line">
      <div className="h-16 flex items-center px-5 border-b border-nyx-line shrink-0">
        <Link href="/admin" className="heading-display text-lg tracking-tight">
          NYX<span className="text-nyx-muted">.admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                active
                  ? "bg-nyx-cream text-nyx-ink"
                  : "text-nyx-muted hover:text-nyx-ink hover:bg-nyx-cream/40"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span className="label-mono text-[11px] tracking-wider">{item.label}</span>
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

export function AdminBottomNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-nyx-bg border-t border-nyx-line flex">
      {BOTTOM_NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              active ? "text-nyx-ink" : "text-nyx-soft"
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="label-mono text-[9px] tracking-wider">{item.label}</span>
          </Link>
        );
      })}
      <Link
        href="/admin/configuracoes"
        className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
          pathname.startsWith("/admin/configuracoes") ? "text-nyx-ink" : "text-nyx-soft"
        }`}
      >
        <MoreHorizontal size={20} strokeWidth={1.5} />
        <span className="label-mono text-[9px] tracking-wider">Mais</span>
      </Link>
    </nav>
  );
}

// Keep AdminNav export for backward compat (unused after layout change)
export function AdminNav() {
  return null;
}
