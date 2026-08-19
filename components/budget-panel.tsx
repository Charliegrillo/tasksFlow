'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Trash2, DollarSign, FileText, Image, File, Download, Pencil, CreditCard, Banknote } from 'lucide-react'
import type { BoardBudget, BudgetItem, BudgetPayment } from '@/lib/db'

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
  const [payments, setPayments] = useState<BudgetPayment[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ type: 'task' as BudgetItem['type'], description: '', amount: 0 })
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [editForm, setEditForm] = useState({ type: 'task' as BudgetItem['type'], description: '', amount: 0 })
  const [editingPaymentInfo, setEditingPaymentInfo] = useState(false)
  const [paymentInfoForm, setPaymentInfoForm] = useState({ bankName: '', accountHolder: '', accountNumber: '', clabe: '' })
  const [editingTaxRate, setEditingTaxRate] = useState(false)
  const [taxRateForm, setTaxRateForm] = useState(16)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: 0, description: '', date: new Date().toISOString().slice(0, 10) })
  const [editingIdent, setEditingIdent] = useState(false)
  const [identForm, setIdentForm] = useState({ clientName: '', projectName: '', projectDate: '' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch(`/api/budget?boardId=${boardId}`)
      const result = await res.json()
      const b = result.data
      if (!b || cancelled) return
      setBudget(b)
      setNotes(b.notes ?? '')
      setTaxRateForm(b.taxRate ?? 16)
      setPaymentInfoForm({ bankName: b.bankName ?? '', accountHolder: b.accountHolder ?? '', accountNumber: b.accountNumber ?? '', clabe: b.clabe ?? '' })

      if (!b.clientName && !b.projectName) {
        try {
          const boardRes = await fetch(`/api/boards?spaceId=0`)
          const boardData = await boardRes.json()
          const board = (boardData.data ?? []).find((br: { id: number }) => br.id === boardId)
          if (board && !cancelled) {
            let clientName = ''
            let projectName = board.name || ''
            if (board.spaceId) {
              const spaceRes = await fetch(`/api/spaces`)
              const spaceData = await spaceRes.json()
              const space = (spaceData.data ?? []).find((s: { id: number }) => s.id === board.spaceId)
              if (space?.clientId) {
                const clientRes = await fetch(`/api/clients`)
                const clientData = await clientRes.json()
                const client = (clientData.data ?? []).find((c: { id: number }) => c.id === space.clientId)
                if (client) clientName = client.name
              }
            }
            const patchRes = await fetch('/api/budget', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId, clientName, projectName, projectDate: new Date().toISOString().slice(0, 10) }) })
            if (patchRes.ok && !cancelled) { const { data: updated } = await patchRes.json(); setBudget(updated) }
          }
        } catch {}
      }

      setIdentForm({ clientName: b.clientName || '', projectName: b.projectName || '', projectDate: b.projectDate || new Date().toISOString().slice(0, 10) })
      const itemRes = await fetch(`/api/budget/items?budgetId=${b.id}`)
      const itemResult = await itemRes.json()
      if (!cancelled) setItems(itemResult.data ?? [])
      const payRes = await fetch(`/api/budget/payments?budgetId=${b.id}`)
      const payResult = await payRes.json()
      if (!cancelled) setPayments(payResult.data ?? [])
    }
    load()
    return () => { cancelled = true }
  }, [boardId])

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

  function startEditItem(item: BudgetItem) {
    setEditingItem(item)
    setEditForm({ type: item.type, description: item.description, amount: item.amount })
  }

  async function handleUpdateItem() {
    if (!editingItem) return
    const res = await fetch(`/api/budget/items/${editingItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
    if (!res.ok) return
    const { data } = await res.json()
    setItems(v => v.map(i => i.id === editingItem.id ? data : i))
    setEditingItem(null)
    const newActual = items.map(i => i.id === editingItem.id ? data : i).reduce((sum, i) => sum + i.amount, 0)
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

  async function savePaymentInfo() {
    if (!budget) return
    const res = await fetch('/api/budget', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId, ...paymentInfoForm }) })
    if (res.ok) { const { data } = await res.json(); setBudget(data) }
    setEditingPaymentInfo(false)
  }

  async function saveIdent() {
    if (!budget) return
    const res = await fetch('/api/budget', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId, ...identForm }) })
    if (res.ok) { const { data } = await res.json(); setBudget(data) }
    setEditingIdent(false)
  }

  async function saveTaxRate() {
    if (!budget) return
    const res = await fetch('/api/budget', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId, taxRate: taxRateForm }) })
    if (res.ok) { const { data } = await res.json(); setBudget(data) }
    setEditingTaxRate(false)
  }

  async function handleAddPayment() {
    if (!budget || paymentForm.amount <= 0) return
    const res = await fetch('/api/budget/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ budgetId: budget.id, ...paymentForm }) })
    if (!res.ok) return
    const { data } = await res.json()
    setPayments(v => [data, ...v])
    setPaymentForm({ amount: 0, description: '', date: new Date().toISOString().slice(0, 10) })
    setShowAddPayment(false)
  }

  async function handleDeletePayment(payment: BudgetPayment) {
    const res = await fetch(`/api/budget/payments/${payment.id}`, { method: 'DELETE' })
    if (!res.ok) return
    setPayments(v => v.filter(p => p.id !== payment.id))
  }

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0)
  const taxRate = budget?.taxRate ?? 16
  const taxes = subtotal * (taxRate / 100)
  const totalAbonos = payments.reduce((sum, p) => sum + p.amount, 0)
  const total = subtotal + taxes
  const balance = Math.max(total - totalAbonos, 0)
  const invoiceId = `PT-${String(boardId).padStart(4, '0')}`

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-sm border border-border bg-card p-3 shadow-xl sm:p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3 md:gap-4 md:pb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="grid size-9 place-items-center rounded-sm bg-primary/10 md:size-10"><DollarSign className="size-4 text-primary md:size-5" /></div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:text-[10px]">Presupuesto</p>
              <h2 className="mt-1 text-base font-semibold md:text-xl">Presupuesto del Tablero</h2>
              <p className="text-[11px] text-muted-foreground md:text-xs">Gestión de costos del proyecto</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-sm bg-primary px-2.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 md:px-3 md:text-sm"><Download className="size-3.5 md:size-4" /> Exportar</button>
            <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
          </div>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1 md:mt-5 md:gap-5">
          <div className="rounded-sm border border-border bg-background/60 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                {editingIdent ? (
                  <>
                    <div>
                      <label className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Identificación</label>
                      <p className="mt-2 text-sm font-semibold text-foreground">{invoiceId}</p>
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Cliente</label>
                      <input value={identForm.clientName} onChange={e => setIdentForm(v => ({ ...v, clientName: e.target.value }))} placeholder="Nombre del cliente..." className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Proyecto</label>
                      <input value={identForm.projectName} onChange={e => setIdentForm(v => ({ ...v, projectName: e.target.value }))} placeholder="Nombre del proyecto..." className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Fecha</label>
                      <input type="date" value={identForm.projectDate} onChange={e => setIdentForm(v => ({ ...v, projectDate: e.target.value }))} className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Identificación</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{invoiceId}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Cliente</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{budget?.clientName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Proyecto</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{budget?.projectName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Fecha</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{budget?.projectDate ? new Date(budget.projectDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                {editingIdent ? (
                  <>
                    <button onClick={() => { setEditingIdent(false); setIdentForm({ clientName: budget?.clientName ?? '', projectName: budget?.projectName ?? '', projectDate: budget?.projectDate ?? '' }) }} className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary">Cancelar</button>
                    <button onClick={saveIdent} className="rounded-sm bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">Guardar</button>
                  </>
                ) : (
                  <button onClick={() => setEditingIdent(true)} className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary"><Pencil className="size-3.5" /></button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-background/60 p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Ítems del presupuesto</p>
              <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1 rounded-sm bg-primary px-2.5 py-2 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 md:px-3 md:text-xs"><Plus className="size-3" /> Agregar</button>
            </div>

            {showAdd && (
              <div className="mt-3 rounded-sm border border-border bg-background p-3">
                <div className="flex flex-col gap-2 md:flex-row">
                  <select value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value as BudgetItem['type'] }))} className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm outline-none">
                    <option value="task">Tarea</option>
                    <option value="document">Documento</option>
                    <option value="image">Imagen</option>
                    <option value="other">Otro</option>
                  </select>
                  <input value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} placeholder="Descripción..." className="flex-1 rounded-sm border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" autoFocus />
                  <input type="number" value={form.amount || ''} onChange={e => setForm(v => ({ ...v, amount: Number(e.target.value) }))} placeholder="$" className="w-24 rounded-sm border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <button onClick={() => { setShowAdd(false); setForm({ type: 'task', description: '', amount: 0 }) }} className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
                  <button onClick={handleAddItem} disabled={!form.description.trim()} className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Agregar</button>
                </div>
              </div>
            )}

            <div className="mt-3 overflow-x-auto rounded-sm border border-border">
              <table className="w-full border-collapse text-left">
                <thead className="bg-secondary/80">
                  <tr>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]">Nro item</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]">Descripción</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]">Tipo</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]">Precio en $</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:py-3 md:text-[11px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length ? items.map((item, index) => (
                    editingItem?.id === item.id ? (
                      <tr key={item.id} className="border-t border-border bg-primary/5">
                        <td className="px-3 py-2 text-sm text-muted-foreground md:py-3">{index + 1}</td>
                        <td className="px-3 py-2 md:py-3">
                          <input value={editForm.description} onChange={e => setEditForm(v => ({ ...v, description: e.target.value }))} className="w-full rounded-sm border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary" autoFocus />
                        </td>
                        <td className="px-3 py-2 md:py-3">
                          <select value={editForm.type} onChange={e => setEditForm(v => ({ ...v, type: e.target.value as BudgetItem['type'] }))} className="w-full rounded-sm border border-border bg-background px-2 py-1 text-sm outline-none">
                            <option value="task">Tarea</option>
                            <option value="document">Documento</option>
                            <option value="image">Imagen</option>
                            <option value="other">Otro</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 md:py-3">
                          <input type="number" value={editForm.amount || ''} onChange={e => setEditForm(v => ({ ...v, amount: Number(e.target.value) }))} className="w-full rounded-sm border border-border bg-background px-2 py-1 text-right text-sm outline-none focus:border-primary" />
                        </td>
                        <td className="px-3 py-2 text-right md:py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingItem(null)} className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary">Cancelar</button>
                            <button onClick={handleUpdateItem} disabled={!editForm.description.trim()} className="rounded-sm bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Guardar</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={item.id} className="group cursor-pointer border-t border-border hover:bg-secondary/30" onClick={() => startEditItem(item)}>
                        <td className="px-3 py-2.5 text-sm text-muted-foreground md:py-3">{index + 1}</td>
                        <td className="px-3 py-2.5 text-sm font-medium text-foreground md:py-3">{item.description}</td>
                        <td className="px-3 py-2.5 text-sm text-muted-foreground md:py-3">{typeConfig[item.type]?.label ?? item.type}</td>
                        <td className="px-3 py-2.5 text-right text-sm font-semibold text-foreground md:py-3">${item.amount.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right md:py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={e => { e.stopPropagation(); startEditItem(item) }} className="invisible rounded-sm p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary group-hover:visible"><Pencil className="size-3.5" /></button>
                            <button onClick={e => { e.stopPropagation(); handleDeleteItem(item) }} className="invisible rounded-sm p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:visible"><Trash2 className="size-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">No hay ítems en este presupuesto.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            <div className="rounded-sm border border-border bg-background/60 p-3 md:p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Información de pago</p>
                {!editingPaymentInfo && <button onClick={() => setEditingPaymentInfo(true)} className="rounded-sm p-1 text-muted-foreground hover:bg-secondary"><Pencil className="size-3" /></button>}
              </div>
              {editingPaymentInfo ? (
                <div className="mt-3 space-y-2">
                  <div><label className="text-[10px] text-muted-foreground">Banco</label><input value={paymentInfoForm.bankName} onChange={e => setPaymentInfoForm(v => ({ ...v, bankName: e.target.value }))} className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary" /></div>
                  <div><label className="text-[10px] text-muted-foreground">Titular</label><input value={paymentInfoForm.accountHolder} onChange={e => setPaymentInfoForm(v => ({ ...v, accountHolder: e.target.value }))} className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary" /></div>
                  <div><label className="text-[10px] text-muted-foreground">Cuenta</label><input value={paymentInfoForm.accountNumber} onChange={e => setPaymentInfoForm(v => ({ ...v, accountNumber: e.target.value }))} className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary" /></div>
                  <div><label className="text-[10px] text-muted-foreground">CLABE</label><input value={paymentInfoForm.clabe} onChange={e => setPaymentInfoForm(v => ({ ...v, clabe: e.target.value }))} className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary" /></div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => { setEditingPaymentInfo(false); setPaymentInfoForm({ bankName: budget?.bankName ?? '', accountHolder: budget?.accountHolder ?? '', accountNumber: budget?.accountNumber ?? '', clabe: budget?.clabe ?? '' }) }} className="rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary">Cancelar</button>
                    <button onClick={savePaymentInfo} className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Guardar</button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-foreground">
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Banco</span><span className="font-medium">{budget?.bankName || '—'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Titular</span><span className="font-medium">{budget?.accountHolder || '—'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Cuenta</span><span className="font-medium">{budget?.accountNumber || '—'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">CLABE</span><span className="font-medium">{budget?.clabe || '—'}</span></div>
                </div>
              )}
            </div>

            <div className="rounded-sm border border-border bg-background/60 p-3 md:p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Totales</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium text-foreground">${subtotal.toLocaleString()}</span></div>
                <div className="flex items-center justify-between">
                  {editingTaxRate ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Impuestos</span>
                      <input type="number" value={taxRateForm} onChange={e => setTaxRateForm(Number(e.target.value))} className="w-16 rounded-sm border border-border bg-background px-2 py-0.5 text-right text-sm outline-none focus:border-primary" />
                      <span className="text-muted-foreground">%</span>
                      <button onClick={saveTaxRate} className="rounded-sm bg-primary px-2 py-0.5 text-xs text-primary-foreground hover:bg-primary/90">OK</button>
                      <button onClick={() => { setEditingTaxRate(false); setTaxRateForm(budget?.taxRate ?? 16) }} className="rounded-sm px-1 text-xs text-muted-foreground hover:bg-secondary">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingTaxRate(true)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">Impuestos ({taxRate}%) <Pencil className="size-2.5" /></button>
                  )}
                  <span className="font-medium text-foreground">${taxes.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Total</span><span className="text-base font-semibold text-foreground">${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div>
                <div className="border-t border-border pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Abonos ({payments.length})</span>
                    <span className="font-medium text-emerald-500">-${totalAbonos.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Saldo pendiente</span><span className="font-semibold text-foreground">${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-background/60 p-3 md:p-4">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs">Notas del proyecto</label>
            {editingNotes ? (
              <div className="mt-2">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" autoFocus />
                <button onClick={saveNotes} className="mt-2 rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Guardar</button>
              </div>
            ) : (
              <p onClick={() => setEditingNotes(true)} className="mt-2 cursor-pointer rounded-sm border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">{notes || 'Click para agregar notas del proyecto...'}</p>
            )}
          </div>

          <div className="rounded-sm border border-border bg-background/60 p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Banknote className="size-4 text-emerald-500" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[10px]">Abonos</p>
              </div>
              <button onClick={() => setShowAddPayment(true)} className="inline-flex items-center gap-1 rounded-sm bg-emerald-600 px-2.5 py-2 text-[11px] font-medium text-white hover:bg-emerald-700 md:px-3 md:text-xs"><Plus className="size-3" /> Agregar abono</button>
            </div>

            {showAddPayment && (
              <div className="mt-3 rounded-sm border border-border bg-background p-3">
                <div className="flex flex-col gap-2 md:flex-row">
                  <input type="number" value={paymentForm.amount || ''} onChange={e => setPaymentForm(v => ({ ...v, amount: Number(e.target.value) }))} placeholder="$ Monto" className="w-32 rounded-sm border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" autoFocus />
                  <input value={paymentForm.description} onChange={e => setPaymentForm(v => ({ ...v, description: e.target.value }))} placeholder="Descripción (opcional)..." className="flex-1 rounded-sm border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  <input type="date" value={paymentForm.date} onChange={e => setPaymentForm(v => ({ ...v, date: e.target.value }))} className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <button onClick={() => { setShowAddPayment(false); setPaymentForm({ amount: 0, description: '', date: new Date().toISOString().slice(0, 10) }) }} className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
                  <button onClick={handleAddPayment} disabled={paymentForm.amount <= 0} className="rounded-sm bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Agregar</button>
                </div>
              </div>
            )}

            {payments.length ? (
              <div className="mt-3 space-y-1">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-2 hover:bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <CreditCard className="size-3.5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">${p.amount.toLocaleString()}</p>
                        {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <button onClick={() => handleDeletePayment(p)} className="rounded-sm p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-center text-sm text-muted-foreground">No hay abonos registrados.</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3 md:pt-4">
            <p className="text-xs text-muted-foreground">Total presupuestado: <span className="font-semibold text-foreground">${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></p>
            <p className="text-xs text-muted-foreground">Abonado: <span className="font-semibold text-emerald-500">${totalAbonos.toLocaleString()}</span> | Pendiente: <span className="font-semibold text-foreground">${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
