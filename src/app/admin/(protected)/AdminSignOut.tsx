"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
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
      className="label-mono text-nyx-muted hover:text-nyx-ink transition-colors"
    >
      Sair
    </button>
  );
}
