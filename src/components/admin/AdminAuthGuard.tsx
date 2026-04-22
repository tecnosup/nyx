"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

type GuardState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "unauthenticated" }
  | { status: "forbidden"; user: User }
  | { status: "authorized"; user: User };

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GuardState>({ status: "loading" });

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setState({ status: "unconfigured" });
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ status: "unauthenticated" });
        router.replace("/admin/login");
        return;
      }
      const token = await user.getIdTokenResult(true);
      if (token.claims.admin === true) {
        setState({ status: "authorized", user });
      } else {
        setState({ status: "forbidden", user });
      }
    });
    return () => unsub();
  }, [router]);

  if (state.status === "loading" || state.status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="label-mono text-nyx-muted">Carregando…</p>
      </div>
    );
  }

  if (state.status === "unconfigured") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="label-mono text-nyx-muted mb-3">Admin indisponível</p>
          <h1 className="heading-display text-2xl mb-4">
            Firebase ainda não configurado.
          </h1>
          <p className="text-sm text-nyx-muted leading-relaxed">
            Preencha as variáveis <code>NEXT_PUBLIC_FIREBASE_*</code> em{" "}
            <code>.env.local</code> e reinicie o servidor.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "forbidden") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="label-mono text-nyx-muted mb-3">403</p>
          <h1 className="heading-display text-2xl mb-4">Acesso restrito.</h1>
          <p className="text-sm text-nyx-muted leading-relaxed">
            Sua conta não tem permissão de administração. Fale com a Tecnosup
            para liberar a claim <code>admin</code>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
