"use client";

import { useTransition } from "react";

type ActionResult = { ok: true } | { ok: false; error: string };

interface Props {
  onDelete: () => Promise<ActionResult>;
  confirmMessage: string;
  label?: string;
  variant?: "text" | "button";
}

export function DeleteButton({ onDelete, confirmMessage, label = "Excluir", variant = "text" }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(async () => {
      const res = await onDelete();
      if (!res.ok) alert(res.error);
    });
  }

  const cls = variant === "button"
    ? "label-mono text-[10px] px-3 py-2 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors disabled:opacity-50"
    : "label-mono text-xs text-red-700 hover:text-red-900 disabled:opacity-50";

  return (
    <button type="button" onClick={handleClick} disabled={pending} className={cls}>
      {pending ? "Excluindo…" : label}
    </button>
  );
}
