"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";

export function AdminSignOut() {
  const router = useRouter();

  async function handle() {
    if (!auth) return;
    await fetch("/api/admin/session", { method: "DELETE" });
    await signOut(auth);
    router.replace("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={handle}
      className="flex items-center gap-3 px-3 py-2.5 w-full label-mono text-[11px] tracking-wider text-nyx-muted hover:text-nyx-ink hover:bg-nyx-cream/40 transition-colors rounded-sm"
    >
      <LogOut size={16} strokeWidth={1.5} />
      Sair
    </button>
  );
}
