"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { SizeStockEditor } from "./SizeStockEditor";
import {
  CATEGORY_LABELS,
  type Drop,
  type Product,
  type ProductCategory,
  type ProductStatus,
  type SizeStock,
} from "@/lib/types";

interface Props {
  mode: "create" | "edit";
  product?: Product;
  drops: Drop[];
  action: (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export function ProductForm({ mode, product, drops, action }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? "camisetas"
  );
  const [price, setPrice] = useState<number>(product?.price ?? 0);
  const [dropId, setDropId] = useState<string>(product?.dropId ?? "");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [isLimited, setIsLimited] = useState<boolean>(product?.isLimited ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [sizes, setSizes] = useState<SizeStock[]>(product?.sizes ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", name);
    fd.set("slug", slug);
    fd.set("description", description);
    fd.set("category", category);
    fd.set("price", String(price));
    fd.set("dropId", dropId);
    fd.set("status", status);
    if (isLimited) fd.set("isLimited", "on");
    fd.set("images", JSON.stringify(images));
    fd.set("sizes", JSON.stringify(sizes));

    setError(null);
    startTransition(async () => {
      const res = await action(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Nome" required>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-nyx"
            placeholder="Camiseta Noir Oversized"
          />
        </Field>
        <Field label="Slug (URL)" hint="Gerado do nome se vazio">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="input-nyx font-mono text-sm"
            placeholder="camiseta-noir-oversized"
          />
        </Field>
      </div>

      <Field label="Descrição" required>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="input-nyx"
          placeholder="Detalhes da peça, materiais, medidas…"
        />
      </Field>

      <div className="grid md:grid-cols-3 gap-6">
        <Field label="Categoria" required>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="input-nyx"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preço (R$)" required>
          <input
            required
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="input-nyx"
          />
        </Field>
        <Field label="Drop">
          <select
            value={dropId}
            onChange={(e) => setDropId(e.target.value)}
            className="input-nyx"
          >
            <option value="">— Nenhum —</option>
            {drops.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <ImageUploader value={images} onChange={setImages} folder="products" />
      </div>

      <div>
        <SizeStockEditor value={sizes} onChange={setSizes} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Status" required>
          <select
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="input-nyx"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </Field>
        <Field label="Limitado">
          <label className="flex items-center gap-3 border border-nyx-line p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isLimited}
              onChange={(e) => setIsLimited(e.target.checked)}
              className="accent-nyx-ink"
            />
            <span className="text-sm">Edição limitada / peça numerada</span>
          </label>
        </Field>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-nyx-line pt-6">
        <Link href="/admin/produtos" className="label-mono text-nyx-muted hover:text-nyx-ink">
          ← Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending ? "Salvando…" : mode === "create" ? "Criar produto" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-mono text-nyx-muted mb-2 block">
        {label} {required && <span className="text-nyx-ink">*</span>}
      </span>
      {children}
      {hint && <span className="label-mono text-nyx-muted text-[10px] mt-1 block">{hint}</span>}
    </label>
  );
}
