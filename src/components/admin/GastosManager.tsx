"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, X, CheckCircle, TrendingDown, Settings } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  createGastoAction,
  updateGastoAction,
  deleteGastoAction,
  createGastoCategoryAction,
  updateGastoCategoryAction,
  deleteGastoCategoryAction,
} from "@/app/admin/(protected)/financeiro/actions";
import type { Gasto, GastoFrequency, GastoCategoryItem } from "@/lib/admin-gastos";

const FREQUENCIES: GastoFrequency[] = ["mensal", "semanal", "avulso"];
const FREQUENCY_LABELS: Record<GastoFrequency, string> = { mensal: "Mensal", semanal: "Semanal", avulso: "Avulso" };

const COLOR_PALETTE = [
  "#F59E0B", "#F97316", "#EF4444", "#EC4899",
  "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981",
  "#84CC16", "#A3E635", "#6B7280", "#92400E",
];

interface Props {
  gastos: Gasto[];
  categories: GastoCategoryItem[];
  frequencyLabels: Record<string, string>;
}

export function GastosManager({ gastos: initial, categories: initialCats, frequencyLabels }: Props) {
  const [gastos, setGastos] = useState<Gasto[]>(initial);
  const [categories, setCategories] = useState<GastoCategoryItem[]>(initialCats);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [showCats, setShowCats] = useState(false);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  function handleCreated(gasto: Gasto) { setGastos((p) => [gasto, ...p]); setShowForm(false); }
  function handleUpdated(updated: Gasto) { setGastos((p) => p.map((g) => (g.id === updated.id ? updated : g))); setEditing(null); }
  function handleDeleted(id: string) { setGastos((p) => p.filter((g) => g.id !== id)); }

  const active = gastos.filter((g) => g.active);
  const inactive = gastos.filter((g) => !g.active);
  const monthlyTotal = active.filter((g) => g.frequency === "mensal").reduce((s, g) => s + g.amount, 0);
  const sorted = [...active, ...inactive];

  return (
    <div className="border border-nyx-line">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-nyx-line">
        <div className="flex items-center gap-3">
          <TrendingDown size={14} className="text-nyx-muted shrink-0" />
          <div>
            <p className="label-mono text-sm text-nyx-ink">Gastos da empresa</p>
            <p className="label-mono text-[9px] text-nyx-muted mt-0.5">
              {formatPrice(monthlyTotal)}/mês · {active.length} ativo{active.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCats(true)}
            title="Gerenciar categorias"
            className="p-1.5 text-nyx-soft hover:text-nyx-ink transition-colors"
          >
            <Settings size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 label-mono text-[10px] px-3 py-1.5 border border-nyx-ink text-nyx-ink hover:bg-nyx-ink hover:text-nyx-bg transition-colors"
          >
            <Plus size={11} />
            Novo gasto
          </button>
        </div>
      </div>

      {/* List */}
      {gastos.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="label-mono text-xs text-nyx-muted">Nenhum gasto cadastrado.</p>
          <p className="text-xs text-nyx-soft mt-1">Adicione aluguel, marketing e outros custos recorrentes.</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin divide-y divide-nyx-line">
          {sorted.map((g) => (
            <GastoRow
              key={g.id}
              gasto={g}
              category={catMap[g.category]}
              frequencyLabels={frequencyLabels}
              onEdit={() => setEditing(g)}
              onDelete={() => handleDeleted(g.id)}
              onToggle={(updated) => handleUpdated(updated)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <GastoModal
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={handleCreated}
        />
      )}

      {editing && (
        <GastoModal
          gasto={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={handleUpdated}
        />
      )}

      {showCats && (
        <CategoriesModal
          categories={categories}
          onClose={() => setShowCats(false)}
          onChange={setCategories}
        />
      )}
    </div>
  );
}

// ─── Gasto Row ────────────────────────────────────────────────────────────────

function GastoRow({
  gasto, category, frequencyLabels, onEdit, onDelete, onToggle,
}: {
  gasto: Gasto;
  category?: GastoCategoryItem;
  frequencyLabels: Record<string, string>;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (updated: Gasto) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(gasto.active);

  function toggleActive() {
    startTransition(async () => {
      await updateGastoAction(gasto.id, { active: !active });
      const next = !active;
      setActive(next);
      onToggle({ ...gasto, active: next });
    });
  }

  function handleDelete() {
    if (!confirm(`Excluir "${gasto.description}"?`)) return;
    startTransition(async () => { await deleteGastoAction(gasto.id); onDelete(); });
  }

  return (
    <div className={`flex items-center gap-0 transition-opacity ${!active ? "opacity-40" : ""}`}>
      <div
        className="self-stretch w-1 shrink-0"
        style={{ backgroundColor: category?.color ?? "#6B7280" }}
      />
      <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-4">
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${active ? "text-nyx-ink" : "text-nyx-muted line-through"}`}>
            {gasto.description}
          </p>
          <p className="label-mono text-[9px] text-nyx-soft mt-0.5">
            {category?.name ?? gasto.category} · {frequencyLabels[gasto.frequency] ?? gasto.frequency}
          </p>
        </div>
        <p className="text-sm font-medium text-nyx-ink shrink-0 tabular-nums">{formatPrice(gasto.amount)}</p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={pending}
            onClick={toggleActive}
            className={`label-mono text-[9px] px-2 py-1 border transition-colors disabled:opacity-40 ${
              active
                ? "border-emerald-400/60 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                : "border-nyx-line text-nyx-soft hover:border-nyx-muted hover:text-nyx-muted"
            }`}
          >
            {active ? "Ativo" : "Inativo"}
          </button>
          <button type="button" disabled={pending} onClick={onEdit} className="p-1.5 text-nyx-soft hover:text-nyx-ink transition-colors">
            <Pencil size={13} />
          </button>
          <button type="button" disabled={pending} onClick={handleDelete} className="p-1.5 text-nyx-soft hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Gasto Modal ──────────────────────────────────────────────────────────────

function GastoModal({
  gasto, categories, onClose, onSaved,
}: {
  gasto?: Gasto;
  categories: GastoCategoryItem[];
  onClose: () => void;
  onSaved: (g: Gasto) => void;
}) {
  const isEdit = !!gasto;
  const [pending, startTransition] = useTransition();
  const [description, setDescription] = useState(gasto?.description ?? "");
  const [amount, setAmount] = useState(gasto?.amount ? String(gasto.amount) : "");
  const [frequency, setFrequency] = useState<GastoFrequency>(gasto?.frequency ?? "mensal");
  const [category, setCategory] = useState(gasto?.category ?? (categories[0]?.id ?? "outros"));
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
        if (res.ok) { setSuccess(true); onSaved({ ...gasto, description: description.trim(), amount: amt, frequency, category }); }
        else setError((res as { ok: false; error: string }).error);
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

  const selCat = categories.find((c) => c.id === category);

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
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label-mono text-[10px] text-nyx-muted block mb-1">Categoria</label>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: selCat?.color ?? "#6B7280" }} />
                <select className="input-nyx flex-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
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

// ─── Categories Modal ─────────────────────────────────────────────────────────

function CategoriesModal({
  categories: initial,
  onClose,
  onChange,
}: {
  categories: GastoCategoryItem[];
  onClose: () => void;
  onChange: (cats: GastoCategoryItem[]) => void;
}) {
  const [cats, setCats] = useState<GastoCategoryItem[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pending, startTransition] = useTransition();

  function update(updated: GastoCategoryItem[]) {
    setCats(updated);
    onChange(updated);
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir esta categoria? Os gastos que a usam ficarão sem label.")) return;
    startTransition(async () => {
      await deleteGastoCategoryAction(id);
      update(cats.filter((c) => c.id !== id));
    });
  }

  function handleSaveEdit(id: string, name: string, color: string) {
    startTransition(async () => {
      await updateGastoCategoryAction(id, { name, color });
      update(cats.map((c) => (c.id === id ? { ...c, name, color } : c)));
      setEditingId(null);
    });
  }

  function handleCreate(name: string, color: string) {
    startTransition(async () => {
      const res = await createGastoCategoryAction(name, color);
      if (res.ok && res.id) {
        const newCat: GastoCategoryItem = { id: res.id, name, color, createdAt: Date.now() };
        update([...cats, newCat]);
        setShowAdd(false);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-nyx-bg border border-nyx-line p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="heading-display text-xl">Categorias de gastos</h2>
          <button onClick={onClose} className="text-nyx-muted hover:text-nyx-ink"><X size={18} /></button>
        </div>

        <div className="space-y-2 mb-4">
          {cats.map((cat) =>
            editingId === cat.id ? (
              <CategoryForm
                key={cat.id}
                initial={cat}
                pending={pending}
                onSave={(name, color) => handleSaveEdit(cat.id, name, color)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div key={cat.id} className="flex items-center gap-3 px-3 py-2.5 border border-nyx-line">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                <p className="text-sm text-nyx-ink flex-1">{cat.name}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(cat.id)}
                    className="p-1.5 text-nyx-soft hover:text-nyx-ink transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-nyx-soft hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {showAdd ? (
          <CategoryForm
            pending={pending}
            onSave={handleCreate}
            onCancel={() => setShowAdd(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 label-mono text-[10px] px-3 py-2 border border-nyx-line text-nyx-muted hover:text-nyx-ink hover:border-nyx-muted transition-colors"
          >
            <Plus size={11} />
            Nova categoria
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Category Form (inline) ───────────────────────────────────────────────────

function CategoryForm({
  initial,
  pending,
  onSave,
  onCancel,
}: {
  initial?: GastoCategoryItem;
  pending: boolean;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? COLOR_PALETTE[0]);

  return (
    <div className="border border-nyx-line p-4 space-y-3">
      <div>
        <label className="label-mono text-[9px] text-nyx-muted block mb-1">Nome da categoria</label>
        <input
          className="input-nyx"
          placeholder="Ex: Equipamentos"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <label className="label-mono text-[9px] text-nyx-muted block mb-2">Cor</label>
        <div className="grid grid-cols-6 gap-1.5">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-sm transition-transform hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-offset-nyx-bg ring-nyx-ink" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: color }} />
          <input
            type="text"
            className="input-nyx text-xs w-28"
            placeholder="#000000"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="label-mono text-[10px] px-3 py-1.5 border border-nyx-line text-nyx-muted hover:text-nyx-ink transition-colors">
          Cancelar
        </button>
        <button
          type="button"
          disabled={pending || !name.trim()}
          onClick={() => onSave(name.trim(), color)}
          className="label-mono text-[10px] px-4 py-1.5 bg-nyx-ink text-nyx-bg hover:bg-nyx-muted transition-colors disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
