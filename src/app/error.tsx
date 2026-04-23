"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-nyx-bg px-6">
      <div className="text-center max-w-md">
        <p className="label-mono text-nyx-muted mb-6">Erro</p>
        <h1 className="heading-display text-5xl md:text-6xl text-nyx-ink mb-6">
          Algo deu errado.
        </h1>
        <p className="text-nyx-muted leading-relaxed mb-10">
          Tivemos um problema inesperado. Tenta de novo — se persistir, nos
          chame no Instagram.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Tentar de novo
          </button>
          <Link href="/" className="btn-ghost">
            Voltar à home
          </Link>
        </div>
        {error.digest && (
          <p className="label-mono text-xs text-nyx-soft mt-10">
            ref: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
