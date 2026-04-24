"use client";

import { useTransition } from "react";

type ActionResult = { ok: true } | { ok: false; error: string };

interface Props {
  onRestore: () => Promise<ActionResult>;
  label?: string;
  pendingLabel?: string;
}

export function RestoreButton({ onRestore, label = "Restaurar", pendingLabel = "Restaurando…" }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await onRestore();
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="label-mono text-xs text-nyx-muted hover:text-nyx-ink disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
