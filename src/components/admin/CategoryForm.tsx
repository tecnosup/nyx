"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { CategoryDoc } from "@/lib/admin-categories";

interface Props {
  mode: "create" | "edit";
  category?: CategoryDoc;
  action: (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export function CategoryForm({ mode, category, action }: Props) {
  const [label, setLabel] = useState(category?.label ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("label", label);
    fd.set("slug", slug);

    setError(null);
    startTransition(async () => {
      const res = await action(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <label className="block">
        <span className="label-mono text-nyx-muted mb-2 flex justify-between">
          <span>Nome <span className="text-nyx-ink">*</span></span>
          <span className="text-[10px]">{label.length}/30</span>
        </span>
        <input
          required
          maxLength={30}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="input-nyx"
          placeholder="Camisetas"
        />
      </label>

      <label className="block">
        <span className="label-mono text-nyx-muted mb-2 block">
          Slug (URL)
        </span>
        <input
          maxLength={50}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="input-nyx font-mono text-sm"
          placeholder="camisetas"
        />
        <span className="label-mono text-[10px] text-nyx-muted mt-1 block">
          Gerado do nome se vazio. Usado na URL de filtro: /produtos?categoria=slug
        </span>
      </label>

      {error && (
        <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-nyx-line pt-6">
        <Link href="/admin/categorias" className="label-mono text-nyx-muted hover:text-nyx-ink">
          ← Cancelar
        </Link>
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending
            ? "Salvando…"
            : mode === "create"
            ? "Criar categoria"
            : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
