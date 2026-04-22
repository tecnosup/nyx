"use client";

import { useTransition } from "react";

type ActionResult = { ok: true } | { ok: false; error: string };

interface Props {
  onDelete: () => Promise<ActionResult>;
  confirmMessage: string;
  label?: string;
}

export function DeleteButton({ onDelete, confirmMessage, label = "Excluir" }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(async () => {
      const res = await onDelete();
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="label-mono text-xs text-red-700 hover:text-red-900 disabled:opacity-50"
    >
      {pending ? "Excluindo…" : label}
    </button>
  );
}
