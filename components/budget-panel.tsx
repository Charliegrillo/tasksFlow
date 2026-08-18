'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Trash2, DollarSign, FileText, Image, File, Download } from 'lucide-react'
import type { BoardBudget, BudgetItem } from '@/lib/db'

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  task: { icon: FileText, label: 'Tarea', color: 'text-blue-500' },
  document: { icon: FileText, label: 'Documento', color: 'text-amber-500' },
  image: { icon: Image, label: 'Imagen', color: 'text-emerald-500' },
  other: { icon: File, label: 'Otro', color: 'text-muted-foreground' },
}

type Props = { boardId: number; onClose: () => void }

export function BudgetPanel({ boardId, onClose }: Props) {
  const [budget, setBudget] = useState<BoardBudget | null>(null)
  const [items, setItems] = useState<BudgetItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ type: 'task' as BudgetItem['type'], description: '', amount: 0 })
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)

  useEffect(() => {
    fetch(`/api/budget?boardId=${boardId}`).then(r => r.json()).then(result => { setBudget(result.data); setNotes(result.data?.notes ?? '') })
    fetch(`/api/budget/items?budgetId=0`).then(() => {})
  }, [boardId])

  useEffect(() => {
    if (budget) fetch(`/api/budget/items?budgetId=${budget.id}`).then(r => r.json()).then(result => setItems(result.data ?? []))
  }, [budget])

  async function handleAddItem() {
    if (!budget || !form.description.trim()) return
    const res = await fetch('/api/budget/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ budgetId: budget.id, ...form }) })
    if (!res.ok) return
    const { data } = await res.json()
    setItems(v => [...v, data])
    setForm({ type: 'task', description: '', amount: 0 })
    setShowAdd(false)
    const newActual = items.reduce((sum, i) => sum + i.amount, 0) + data.amount
    const patchRes = await fetch('/api/budget', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId, actualTotal: newActual }) })
    if (patchRes.ok) { const { data: b } = await patchRes.json(); setBudget(b) }
  }

  async function handleDeleteItem(item: BudgetItem) {
    if (!budget) return
    const res = await fetch(`/api/budget/items/${item.id}`, { method: 'DELETE' })
    if (!res.ok) return
    setItems(v => v.filter(i => i.id !== item.id))
    const newActual = items.filter(i => i.id !== item.id).reduce((sum, i) => sum + i.amount, 0)
    const patchRes = await fetch('/api/budget', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId, actualTotal: newActual }) })
    if (patchRes.ok) { const { data: b } = await patchRes.json(); setBudget(b) }
  }

  async function saveNotes() {
    if (!budget) return
    const res = await fetch('/api/budget', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId, notes }) })
    if (res.ok) { const { data } = await res.json(); setBudget(data) }
    setEditingNotes(false)
  }

  async function saveEstimated(val: number) {
    if (!budget) return
    const res = await fetch('/api/budget', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId, estimatedTotal: val }) })
    if (res.ok) { const { data } = await res.json(); setBudget(data) }
  }

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0)
  const taxRate = 0.16
  const taxes = subtotal * taxRate
  const advanceAmount = 30
  const total = subtotal + taxes
  const balance = Math.max(total - advanceAmount, 0)
  const invoiceId = `PT-${String(boardId).padStart(4, '0')}`
  const invoiceDate = budget?.createdAt ? new Date(budget.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-xl sm:p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3 md:gap-4 md:pb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 md:size-10"><DollarSign className="size-4 text-primary md:size-5" /></div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:text-[10px]">Presupuesto</p>
              <h2 className="mt-1 text-base font-semibold md:text-xl">Presupuesto del Tablero</h2>
              <p className="text-[11px] text-muted-foreground md:text-xs">Gestión de costos del proyecto</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-2.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 md:px-3 md:text-sm"><Download className="size-3.5 md:size-4" /> Exportar</button>
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
          </div>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1 md:mt-5 md:gap-5">
          <div className="rounded-2xl border border-border bg-background/60 p-3 md:p-4">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Identificación</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{invoiceId}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Cliente</p>
                <p className="mt-2 text-sm font-medium text-foreground">Cliente principal</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Proyecto</p>
                <p className="mt-2 text-sm font-medium text-foreground">Tablero #{boardId}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Fecha</p>
                <p className="mt-2 text-sm font-medium text-foreground">{invoiceDate}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Ítems del presupuesto</p>
              <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-2 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 md:px-3 md:text-xs"><Plus className="size-3" /> Agregar</button>
            </div>

            {showAdd && (
              <div className="mt-3 rounded-xl border border-border bg-background p-3">
                <div className="flex flex-col gap-2 md:flex-row">
                  <select value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value as BudgetItem['type'] }))} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none">
                    <option value="task">Tarea</option>
                    <option value="document">Documento</option>
                    <option value="image">Imagen</option>
                    <option value="other">Otro</option>
                  </select>
                  <input value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} placeholder="Descripción..." className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" autoFocus />
                  <input type="number" value={form.amount || ''} onChange={e => setForm(v => ({ ...v, amount: Number(e.target.value) }))} placeholder="$" className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <button onClick={() => { setShowAdd(false); setForm({ type: 'task', description: '', amount: 0 }) }} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
                  <button onClick={handleAddItem} disabled={!form.description.trim()} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Agregar</button>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="max-h-[28vh] overflow-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead className="bg-secondary/80">
                  <tr>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]">Nro item</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]">Descripción</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]">Cantidad</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]">Precio en $</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length ? items.map((item, index) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="px-3 py-2.5 text-sm text-muted-foreground md:py-3">{index + 1}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-foreground md:py-3">{item.description}</td>
                      <td className="px-3 py-2.5 text-sm text-foreground md:py-3">1</td>
                      <td className="px-3 py-2.5 text-right text-sm font-semibold text-foreground md:py-3">${item.amount.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-muted-foreground">No hay ítems en este presupuesto.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr] md:gap-4">
            <div className="rounded-xl border border-border bg-background/60 p-3 md:p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Información de pago</p>
              <div className="mt-3 space-y-2 text-sm text-foreground">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Banco</span><span className="font-medium">Banco de México</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Titular</span><span className="font-medium">Taskflow Studio</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Cuenta</span><span className="font-medium">0012 3456 7890 1234</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">CLABE</span><span className="font-medium">012345678901234567</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-3 md:p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Totales</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium text-foreground">${subtotal.toLocaleString()}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Impuestos (16%)</span><span className="font-medium text-foreground">${taxes.toLocaleString()}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Total</span><span className="text-base font-semibold text-foreground">${total.toLocaleString()}</span></div>
                <div className="flex items-center justify-between border-t border-border pt-2"><span className="text-muted-foreground">Abono 30$</span><span className="font-medium text-foreground">${advanceAmount.toLocaleString()}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Saldo pendiente</span><span className="font-semibold text-foreground">${balance.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-3 md:p-4">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs">Notas del proyecto</label>
            {editingNotes ? (
              <div className="mt-2">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" autoFocus />
                <button onClick={saveNotes} className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Guardar</button>
              </div>
            ) : (
              <p onClick={() => setEditingNotes(true)} className="mt-2 cursor-pointer rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">{notes || 'Click para agregar notas del proyecto...'}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3 md:pt-4">
            <p className="text-xs text-muted-foreground">Total presupuestado: <span className="font-semibold text-foreground">${total.toLocaleString()}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
