"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSignOut } from "@/app/admin/(protected)/AdminSignOut";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/drops", label: "Drops" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`label-mono transition-colors ${
              isActive(item.href)
                ? "text-nyx-ink"
                : "text-nyx-muted hover:text-nyx-ink"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <AdminSignOut />
      </nav>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-nyx-ink p-1"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-nyx-ink/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute top-0 right-0 h-full w-64 bg-nyx-bg border-l border-nyx-line flex flex-col">
            <div className="flex items-center justify-between h-16 px-5 border-b border-nyx-line">
              <span className="label-mono text-nyx-muted">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X size={20} className="text-nyx-ink" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`label-mono px-3 py-3 rounded transition-colors ${
                    isActive(item.href)
                      ? "bg-nyx-cream text-nyx-ink"
                      : "text-nyx-muted hover:text-nyx-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-5 border-t border-nyx-line">
              <AdminSignOut />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
