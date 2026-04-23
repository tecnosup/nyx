"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "nyx_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "acknowledged");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[100] border border-nyx-line bg-nyx-bg/95 backdrop-blur p-5 shadow-lg"
    >
      <p className="text-sm text-nyx-ink leading-relaxed">
        Este site usa cookies essenciais para funcionar (sessão, checkout). Ao
        continuar navegando você concorda com a nossa{" "}
        <Link
          href="/privacidade"
          className="underline underline-offset-2 hover:text-nyx-muted"
        >
          política de privacidade
        </Link>
        .
      </p>
      <div className="mt-4 flex justify-end">
        <button
          onClick={dismiss}
          className="label-mono text-xs px-4 py-2 bg-nyx-ink text-nyx-bg hover:bg-nyx-ink/85 transition-colors"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
