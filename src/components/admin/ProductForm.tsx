"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { SizeStockEditor } from "./SizeStockEditor";
import {
  type ColorStock,
  type Drop,
  type Product,
  type ProductCategory,
  type ProductStatus,
  type SizeStock,
  normalizeColors,
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
  const [pricePixStr, setPricePixStr] = useState<string>(
    product ? String(product.pricePix) : ""
  );
  const [priceCardStr, setPriceCardStr] = useState<string>(
    product ? String(product.priceCard) : ""
  );
  const [dropId, setDropId] = useState<string>(product?.dropId ?? "");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [isLimited, setIsLimited] = useState<boolean>(product?.isLimited ?? true);
  const [colors, setColors] = useState<ColorStock[]>(
    product?.colors ? normalizeColors(product.colors) : []
  );
  const [colorInput, setColorInput] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  // standaloneSizes: used only when product has no colors
  const [sizes, setSizes] = useState<SizeStock[]>(product?.sizes ?? []);
  const [hasDiscount, setHasDiscount] = useState<boolean>(
    !!(product?.compareAtPricePix && product.compareAtPricePix > product.pricePix)
  );
  const [compareAtPixStr, setCompareAtPixStr] = useState<string>(
    product?.compareAtPricePix ? String(product.compareAtPricePix) : ""
  );
  const [compareAtCardStr, setCompareAtCardStr] = useState<string>(
    product?.compareAtPriceCard ? String(product.compareAtPriceCard) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function addColor() {
    const trimmed = colorInput.trim();
    if (trimmed && !colors.find((c) => c.name === trimmed) && colors.length < 5) {
      setColors([...colors, { name: trimmed, soldOut: false, sizes: [] }]);
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
    fd.set("pricePix", pricePixStr);
    fd.set("priceCard", priceCardStr);
    if (hasDiscount && compareAtPixStr) fd.set("compareAtPricePix", compareAtPixStr);
    if (hasDiscount && compareAtCardStr) fd.set("compareAtPriceCard", compareAtCardStr);
    fd.set("dropId", dropId);
    fd.set("status", status);
    if (isLimited) fd.set("isLimited", "on");
    fd.set("colors", JSON.stringify(colors));
    fd.set("images", JSON.stringify(images));
    // sizes: standalone only used when no colors; server aggregates from colors otherwise
    fd.set("sizes", JSON.stringify(colors.length > 0 ? [] : sizes));

    setError(null);
    startTransition(async () => {
      const res = await action(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Nome" required hint={`${name.length}/60`}>
          <input
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-nyx"
            placeholder="Camiseta Noir Oversized"
          />
        </Field>
        <Field label="Slug (URL)" hint="Gerado do nome se vazio">
          <input
            maxLength={80}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="input-nyx font-mono text-sm"
            placeholder="camiseta-noir-oversized"
          />
        </Field>
      </div>

      <Field label="Descrição" required hint={`${description.length}/600`}>
        <textarea
          required
          maxLength={600}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="input-nyx"
          placeholder="Detalhes da peça, materiais, medidas…"
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-6">
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

      {/* Preços */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="label-mono text-nyx-muted">Preços</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDiscount}
              onChange={(e) => {
                setHasDiscount(e.target.checked);
                if (!e.target.checked) { setCompareAtPixStr(""); setCompareAtCardStr(""); }
              }}
              className="accent-nyx-ink"
            />
            <span className="label-mono text-[10px] text-nyx-muted">Aplicar desconto</span>
          </label>
        </div>

        {!hasDiscount ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Preço Pix (R$)" required hint="Obrigatório para publicar">
              <input
                required
                type="number"
                min={0.01}
                step={0.01}
                value={pricePixStr}
                onChange={(e) => setPricePixStr(e.target.value)}
                className="input-nyx"
                placeholder="0,00"
              />
            </Field>
            <Field label="Preço Cartão (R$)" hint="Opcional — deixe vazio se não aceita cartão">
              <input
                type="number"
                min={0}
                step={0.01}
                value={priceCardStr}
                onChange={(e) => setPriceCardStr(e.target.value)}
                className="input-nyx"
                placeholder="— opcional —"
              />
            </Field>
          </div>
        ) : (
          <div className="border border-amber-400/40 bg-amber-50/5 p-4 space-y-4">
            <div>
              <p className="label-mono text-[10px] text-nyx-muted mb-3">Valor cheio <span className="text-nyx-soft">(aparece riscado)</span></p>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Pix (R$)" required>
                  <input
                    required
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={compareAtPixStr}
                    onChange={(e) => setCompareAtPixStr(e.target.value)}
                    className="input-nyx"
                    placeholder="Ex: 99,90"
                  />
                </Field>
                <Field label="Cartão (R$)" hint="Opcional">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={compareAtCardStr}
                    onChange={(e) => setCompareAtCardStr(e.target.value)}
                    className="input-nyx"
                    placeholder="— opcional —"
                  />
                </Field>
              </div>
            </div>

            <div>
              <p className="label-mono text-[10px] text-nyx-muted mb-3">Valor com desconto <span className="text-nyx-soft">(preço final)</span></p>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Pix (R$)" required>
                  <input
                    required
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={pricePixStr}
                    onChange={(e) => setPricePixStr(e.target.value)}
                    className="input-nyx"
                    placeholder="0,00"
                  />
                </Field>
                <Field label="Cartão (R$)" hint="Opcional">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={priceCardStr}
                    onChange={(e) => setPriceCardStr(e.target.value)}
                    className="input-nyx"
                    placeholder="— opcional —"
                  />
                </Field>
              </div>
            </div>

            {compareAtPixStr && pricePixStr && parseFloat(compareAtPixStr) > parseFloat(pricePixStr) && (
              <p className="label-mono text-[10px] text-emerald-600">
                Desconto: {Math.round((1 - parseFloat(pricePixStr) / parseFloat(compareAtPixStr)) * 100)}% off
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cores disponíveis */}
      <div>
        <p className="label-mono text-nyx-muted mb-3">Cores disponíveis</p>
        {colors.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={30}
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
          {colors.length === 0
            ? "Adicione cores para definir estoque por cor. Até 5 cores."
            : "Pressione Enter ou clique + Cor para adicionar. Estoques e soldOut por cor abaixo."}
        </p>
      </div>

      <div>
        <ImageUploader value={images} onChange={setImages} folder="products" />
      </div>

      <div>
        <SizeStockEditor
          colors={colors}
          onChangeColors={setColors}
          standaloneSizes={sizes}
          onChangeStandalone={setSizes}
        />
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

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 border-t border-nyx-line pt-6">
        <Link
          href="/admin/produtos"
          className="inline-flex items-center justify-center label-mono text-xs px-5 py-2.5 border border-nyx-line text-nyx-muted hover:border-nyx-muted hover:text-nyx-ink transition-colors"
        >
          ← Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 sm:flex-none inline-flex items-center justify-center label-mono text-xs px-8 py-2.5 bg-nyx-ink text-nyx-bg hover:bg-nyx-muted transition-colors disabled:opacity-50"
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
