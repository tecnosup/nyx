"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Drop, DropStatus } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";

interface Props {
  mode: "create" | "edit";
  drop?: Drop;
  action: (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;
}

function toDateInput(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DropForm({ mode, drop, action }: Props) {
  const [name, setName] = useState(drop?.name ?? "");
  const [slug, setSlug] = useState(drop?.slug ?? "");
  const [description, setDescription] = useState(drop?.description ?? "");
  const [heroImage, setHeroImage] = useState(drop?.heroImage ?? "");
  const [status, setStatus] = useState<DropStatus>(drop?.status ?? "upcoming");
  const [releaseDate, setReleaseDate] = useState<string>(
    drop ? toDateInput(drop.releaseDate) : toDateInput(Date.now() + 14 * 24 * 60 * 60 * 1000)
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", name);
    fd.set("slug", slug);
    fd.set("description", description);
    fd.set("heroImage", heroImage);
    fd.set("status", status);
    fd.set("releaseDate", new Date(releaseDate).toISOString());

    setError(null);
    startTransition(async () => {
      const res = await action(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid md:grid-cols-2 gap-6">
        <label className="block">
          <span className="label-mono text-nyx-muted mb-2 block">
            Nome <span className="text-nyx-ink">*</span>
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-nyx"
            placeholder="Radar Tóquio"
          />
        </label>
        <label className="block">
          <span className="label-mono text-nyx-muted mb-2 block">Slug (URL)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="input-nyx font-mono text-sm"
            placeholder="radar-toquio"
          />
        </label>
      </div>

      <label className="block">
        <span className="label-mono text-nyx-muted mb-2 block">
          Descrição <span className="text-nyx-ink">*</span>
        </span>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="input-nyx"
        />
      </label>

      <div className="grid md:grid-cols-2 gap-6">
        <label className="block">
          <span className="label-mono text-nyx-muted mb-2 block">
            Data de lançamento <span className="text-nyx-ink">*</span>
          </span>
          <input
            required
            type="datetime-local"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="input-nyx"
          />
        </label>
        <label className="block">
          <span className="label-mono text-nyx-muted mb-2 block">
            Status <span className="text-nyx-ink">*</span>
          </span>
          <select
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as DropStatus)}
            className="input-nyx"
          >
            <option value="upcoming">Próximo</option>
            <option value="active">Ativo</option>
            <option value="archived">Arquivado</option>
          </select>
        </label>
      </div>

      {status === "active" && (
        <div className="border border-nyx-line bg-nyx-cream/40 p-4 text-xs text-nyx-muted">
          Ao salvar com status <strong>ativo</strong>, qualquer outro drop ativo será
          automaticamente arquivado. Só um drop pode estar ativo por vez.
        </div>
      )}

      <div>
        <p className="label-mono text-nyx-muted mb-3">Hero image do drop</p>
        <ImageUploader
          value={heroImage ? [heroImage] : []}
          onChange={(imgs) => setHeroImage(imgs[0] ?? "")}
          folder="drops"
          max={1}
        />
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-nyx-line pt-6">
        <Link href="/admin/drops" className="label-mono text-nyx-muted hover:text-nyx-ink">
          ← Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending ? "Salvando…" : mode === "create" ? "Criar drop" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
