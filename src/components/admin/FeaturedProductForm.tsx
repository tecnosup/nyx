"use client";

import { useActionState } from "react";
import { setFeaturedProductAction } from "@/app/admin/(protected)/configuracoes/actions";

interface Props {
  products: { id: string; name: string }[];
  currentId: string | null;
}

export function FeaturedProductForm({ products, currentId }: Props) {
  const [state, action, pending] = useActionState(setFeaturedProductAction, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <select
        name="productId"
        defaultValue={currentId ?? ""}
        className="w-full border border-nyx-line bg-nyx-bg text-nyx-ink px-3 py-2 text-sm focus:outline-none focus:border-nyx-soft"
      >
        <option value="">— Automático (mais recente) —</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary self-start"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
