"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { SizeStockEditor } from "./SizeStockEditor";
import {
  type Drop,
  type Product,
  type ProductCategory,
  type ProductStatus,
  type SizeStock,
} from "@/lib/types";

interface CategoryOption {
  slug: string;
  label: string;
}

interface Props {
  mode: "create" | "edit";
  product?: Product;
  drops: Drop[];
  categories: CategoryOption[];
  action: (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export function ProductForm({ mode, product, drops, categories, action }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? (categories[0]?.slug ?? "camisetas")
  );
  const [priceStr, setPriceStr] = useState<string>(
    product ? String(product.price) : ""
  );
  const [dropId, setDropId] = useState<string>(product?.dropId ?? "");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [isLimited, setIsLimited] = useState<boolean>(product?.isLimited ?? true);
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [colorInput, setColorInput] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [sizes, setSizes] = useState<SizeStock[]>(product?.sizes ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function addColor() {
    const trimmed = colorInput.trim();
    if (trimmed && !colors.includes(trimmed) && colors.length < 5) {
      setColors([...colors, trimmed]);
      setColorInput("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", name);
    fd.set("slug", slug);
    fd.set("description", description);
    fd.set("category", category);
    fd.set("price", priceStr);
    fd.set("dropId", dropId);
    fd.set("status", status);
    if (isLimited) fd.set("isLimited", "on");
    fd.set("colors", JSON.stringify(colors));
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
            onChange={(e) => setCategory(e.target.value)}
            className="input-nyx"
          >
            {categories.map(({ slug, label }) => (
              <option key={slug} value={slug}>
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
            step={0.01}
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
            className="input-nyx"
            placeholder="0,00"
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

      {/* Cores disponíveis */}
      <div>
        <p className="label-mono text-nyx-muted mb-3">Cores disponíveis</p>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {colors.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 border border-nyx-line px-3 py-1.5 text-sm"
              >
                {c}
                <button
                  type="button"
                  onClick={() => setColors(colors.filter((x) => x !== c))}
                  className="text-nyx-muted hover:text-nyx-ink"
                  aria-label={`Remover ${c}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {colors.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addColor();
                }
              }}
              placeholder="Ex: Preto, Branco, Verde…"
              className="input-nyx flex-1"
            />
            <button
              type="button"
              onClick={addColor}
              className="label-mono border border-nyx-line px-4 py-2 hover:border-nyx-ink transition-colors"
            >
              + Cor
            </button>
          </div>
        )}
        <p className="label-mono text-[10px] text-nyx-muted mt-1">
          Pressione Enter ou clique + Cor para adicionar. Até 5 cores.
        </p>
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
