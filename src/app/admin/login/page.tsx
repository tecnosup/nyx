"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type AuthError,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const token = await user.getIdTokenResult(true);
      if (token.claims.admin !== true) return;
      const idToken = await user.getIdToken(true);
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (res.ok) router.replace("/admin");
    });
    return () => unsub();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) {
      setError("Firebase não configurado.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdTokenResult(true);
      if (token.claims.admin !== true) {
        setError("Conta sem permissão de administrador.");
        setSubmitting(false);
        return;
      }
      const idToken = await cred.user.getIdToken(true);
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Falha ao criar sessão.");
        setSubmitting(false);
        return;
      }
      router.replace("/admin");
    } catch (err) {
      const code = (err as AuthError).code ?? "auth/erro";
      setError(friendlyError(code));
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-nyx-bg">
      <div className="w-full max-w-sm">
        <Link href="/" className="heading-display text-3xl block text-center mb-10">
          NYX<span className="text-nyx-muted">.</span>
        </Link>

        {!isFirebaseConfigured && (
          <div className="mb-6 border border-nyx-line p-4 text-sm text-nyx-muted">
            Firebase ainda não configurado. Preencha{" "}
            <code>NEXT_PUBLIC_FIREBASE_*</code> em <code>.env.local</code>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-mono text-nyx-muted block mb-2">
              E-mail
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-nyx-line px-4 py-3 bg-transparent focus:outline-none focus:border-nyx-ink"
            />
          </div>
          <div>
            <label className="label-mono text-nyx-muted block mb-2">
              Senha
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-nyx-line px-4 py-3 bg-transparent focus:outline-none focus:border-nyx-ink"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 label-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !isFirebaseConfigured}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/network-request-failed":
      return "Falha de rede. Verifique sua conexão.";
    default:
      return "Não foi possível entrar.";
  }
}
