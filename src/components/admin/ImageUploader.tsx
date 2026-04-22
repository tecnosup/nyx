"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  max?: number;
}

export function ImageUploader({
  value,
  onChange,
  folder = "products",
  max = 8,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      setError(`Máximo ${max} imagens.`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Falha no upload.");
        }
        uploaded.push(data.url);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(idx: number, delta: number) {
    const next = [...value];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function addUrl() {
    const raw = window.prompt("URL da imagem (https://…)");
    if (!raw) return;
    const url = raw.trim();
    if (!url.startsWith("http")) {
      setError("URL inválida.");
      return;
    }
    if (value.length >= max) {
      setError(`Máximo ${max} imagens.`);
      return;
    }
    setError(null);
    onChange([...value, url]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="label-mono text-nyx-muted">
          Imagens ({value.length}/{max})
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addUrl}
            className="label-mono text-nyx-muted hover:text-nyx-ink"
          >
            + URL
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || value.length >= max}
            className="label-mono text-nyx-ink hover:text-nyx-muted disabled:opacity-40"
          >
            {uploading ? "Enviando…" : "+ Upload"}
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {value.length === 0 && (
        <div className="border border-dashed border-nyx-line p-10 text-center text-sm text-nyx-muted">
          Nenhuma imagem. Clique em <strong>+ Upload</strong> ou <strong>+ URL</strong>.
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {value.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative border border-nyx-line group aspect-[4/5] bg-nyx-cream/40"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="object-cover"
                unoptimized={url.startsWith("http")}
              />
              {idx === 0 && (
                <span className="absolute top-2 left-2 label-mono bg-nyx-ink text-nyx-bg px-2 py-0.5 text-[10px]">
                  CAPA
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-stretch opacity-0 group-hover:opacity-100 transition-opacity bg-nyx-bg/90">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="flex-1 label-mono py-2 hover:bg-nyx-cream disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === value.length - 1}
                  className="flex-1 label-mono py-2 hover:bg-nyx-cream disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="flex-1 label-mono py-2 hover:bg-red-100 text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="label-mono text-red-700 mt-3 text-xs">{error}</p>
      )}
    </div>
  );
}
