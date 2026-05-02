"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, X, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createGastoAction, updateGastoAction, deleteGastoAction } from "@/app/admin/(protected)/financeiro/actions";
import type { Gasto, GastoCategory, GastoFrequency } from "@/lib/admin-gastos";

const CATEGORIES: GastoCategory[] = ["aluguel", "insumos", "marketing", "logistica", "outros"];
const FREQUENCIES: GastoFrequency[] = ["mensal", "semanal", "avulso"];

interface Props {
  gastos: Gasto[];
  categoryLabels: Record<string, string>;
  frequencyLabels: Record<string, string>;
}

export function GastosManager({ gastos: initial, categoryLabels, frequencyLabels }: Props) {
  const [gastos, setGastos] = useState<Gasto[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);

  function handleCreated(gasto: Gasto) {
    setGastos((prev) => [gasto, ...prev]);
    setShowForm(false);
  }

  function handleUpdated(updated: Gasto) {
    setGastos((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setEditing(null);
  }

  function handleDeleted(id: string) {
    setGastos((prev) => prev.filter((g) => g.id !== id));
  }

  const activeTotal = gastos
    .filter((g) => g.active && g.frequency === "mensal")
    .reduce((s, g) => s + g.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-nyx-muted">
          Total mensal recorrente: <span className="text-nyx-ink font-medium">{formatPrice(activeTotal)}</span>
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 label-mono text-xs px-4 py-2 border border-nyx-ink text-nyx-ink hover:bg-nyx-ink hover:text-nyx-bg transition-colors"
        >
          <Plus size={13} />
          Novo gasto
        </button>
      </div>

      {gastos.length === 0 ? (
        <div className="border border-nyx-line p-8 text-center">
          <p className="label-mono text-nyx-muted text-xs">Nenhum gasto cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gastos.map((g) => (
            <GastoRow
              key={g.id}
              gasto={g}
              categoryLabels={categoryLabels}
              frequencyLabels={frequencyLabels}
              onEdit={() => setEditing(g)}
              onDelete={() => handleDeleted(g.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <GastoModal
          categoryLabels={categoryLabels}
          frequencyLabels={frequencyLabels}
          onClose={() => setShowForm(false)}
          onSaved={handleCreated}
        />
      )}

      {editing && (
        <GastoModal
          gasto={editing}
          categoryLabels={categoryLabels}
          frequencyLabels={frequencyLabels}
          onClose={() => setEditing(null)}
          onSaved={handleUpdated}
        />
      )}
    </div>
  );
}

function GastoRow({
  gasto, categoryLabels, frequencyLabels, onEdit, onDelete,
}: {
  gasto: Gasto;
  categoryLabels: Record<string, string>;
  frequencyLabels: Record<string, string>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(gasto.active);

  function toggleActive() {
    startTransition(async () => {
      await updateGastoAction(gasto.id, { active: !active });
      setActive((p) => !p);
    });
  }

  function handleDelete() {
    if (!confirm(`Excluir "${gasto.description}"?`)) return;
    startTransition(async () => {
      await deleteGastoAction(gasto.id);
      onDelete();
    });
  }

  return (
    <div className={`border border-nyx-line p-4 flex items-center gap-4 ${!active ? "opacity-50" : ""}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-nyx-ink truncate">{gasto.description}</p>
        <p className="label-mono text-[10px] text-nyx-muted">
          {categoryLabels[gasto.category]} · {frequencyLabels[gasto.frequency]}
        </p>
      </div>
      <p className="text-sm text-nyx-ink font-medium shrink-0">{formatPrice(gasto.amount)}</p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={pending}
          onClick={toggleActive}
          title={active ? "Desativar" : "Ativar"}
          className={`label-mono text-[9px] px-2 py-1 border transition-colors ${active ? "border-green-400 text-green-700" : "border-nyx-line text-nyx-soft"}`}
        >
          {active ? "Ativo" : "Inativo"}
        </button>
        <button type="button" disabled={pending} onClick={onEdit} className="text-nyx-muted hover:text-nyx-ink transition-colors">
          <Pencil size={13} />
        </button>
        <button type="button" disabled={pending} onClick={handleDelete} className="text-nyx-soft hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function GastoModal({
  gasto, categoryLabels, frequencyLabels, onClose, onSaved,
}: {
  gasto?: Gasto;
  categoryLabels: Record<string, string>;
  frequencyLabels: Record<string, string>;
  onClose: () => void;
  onSaved: (g: Gasto) => void;
}) {
  const isEdit = !!gasto;
  const [pending, startTransition] = useTransition();
  const [description, setDescription] = useState(gasto?.description ?? "");
  const [amount, setAmount] = useState(gasto?.amount ? String(gasto.amount) : "");
  const [frequency, setFrequency] = useState<GastoFrequency>(gasto?.frequency ?? "mensal");
  const [category, setCategory] = useState<GastoCategory>(gasto?.category ?? "outros");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function save() {
    setError("");
    const amt = parseFloat(amount);
    if (!description.trim()) { setError("Descrição obrigatória."); return; }
    if (!amt || amt <= 0) { setError("Valor inválido."); return; }

    startTransition(async () => {
      if (isEdit && gasto) {
        const res = await updateGastoAction(gasto.id, { description: description.trim(), amount: amt, frequency, category });
        if (res.ok) {
          setSuccess(true);
          onSaved({ ...gasto, description: description.trim(), amount: amt, frequency, category });
        } else setError((res as { ok: false; error: string }).error);
      } else {
        const res = await createGastoAction({ description: description.trim(), amount: amt, frequency, category });
        if (res.ok) {
          setSuccess(true);
          const fake: Gasto = { id: Date.now().toString(), description: description.trim(), amount: amt, frequency, category, active: true, createdAt: Date.now(), updatedAt: Date.now() };
          setTimeout(() => onSaved(fake), 600);
        } else setError((res as { ok: false; error: string }).error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-nyx-bg border border-nyx-line p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="heading-display text-xl">{isEdit ? "Editar gasto" : "Novo gasto"}</h2>
          <button onClick={onClose} className="text-nyx-muted hover:text-nyx-ink"><X size={18} /></button>
        </div>

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
            <p className="text-sm text-nyx-ink">Salvo com sucesso!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label-mono text-[10px] text-nyx-muted block mb-1">Descrição *</label>
              <input className="input-nyx" placeholder="Ex: Aluguel do espaço" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Valor (R$) *</label>
                <input className="input-nyx" type="number" min="0" step="0.01" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="label-mono text-[10px] text-nyx-muted block mb-1">Frequência</label>
                <select className="input-nyx" value={frequency} onChange={(e) => setFrequency(e.target.value as GastoFrequency)}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{frequencyLabels[f]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label-mono text-[10px] text-nyx-muted block mb-1">Categoria</label>
              <select className="input-nyx" value={category} onChange={(e) => setCategory(e.target.value as GastoCategory)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
              </select>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="label-mono text-xs px-4 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors">Cancelar</button>
              <button type="button" disabled={pending} onClick={save} className="label-mono text-xs px-4 py-2 border border-nyx-ink text-nyx-bg bg-nyx-ink hover:bg-nyx-muted transition-colors disabled:opacity-50">
                {pending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
