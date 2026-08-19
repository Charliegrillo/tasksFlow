'use client'

import { useEffect, useState } from 'react'
import { Check, Trash2, Plus, Pencil, X } from 'lucide-react'
import type { Checklist, ChecklistItem } from '@/lib/db'

interface ChecklistSectionProps {
  taskId: number
}

export function ChecklistSection({ taskId }: ChecklistSectionProps) {
  const [checklists, setChecklists] = useState<(Checklist & { items: ChecklistItem[] })[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [addingItemTo, setAddingItemTo] = useState<number | null>(null)
  const [itemTitle, setItemTitle] = useState('')
  const [editingChecklist, setEditingChecklist] = useState<number | null>(null)
  const [checklistTitleForm, setChecklistTitleForm] = useState('')
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editDue, setEditDue] = useState('')

  useEffect(() => {
    fetch(`/api/checklists?taskId=${taskId}`).then(r => r.json()).then(d => setChecklists(d.data ?? []))
  }, [taskId])

  async function addChecklist() {
    if (!newTitle.trim()) return
    const res = await fetch('/api/checklists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, title: newTitle.trim() }) })
    if (!res.ok) return
    const { data } = await res.json()
    setChecklists(v => [...v, { ...data, items: [] }])
    setNewTitle('')
  }

  async function removeChecklist(id: number) {
    await fetch(`/api/checklists/${id}`, { method: 'DELETE' })
    setChecklists(v => v.filter(c => c.id !== id))
  }

  async function saveChecklistTitle(id: number) {
    if (!checklistTitleForm.trim()) return
    const res = await fetch(`/api/checklists/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: checklistTitleForm.trim() }) })
    if (!res.ok) return
    const { data } = await res.json()
    setChecklists(v => v.map(c => c.id === id ? { ...c, title: data.title } : c))
    setEditingChecklist(null)
  }

  async function addItem(checklistId: number) {
    if (!itemTitle.trim()) return
    const res = await fetch(`/api/checklists/${checklistId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checklistId, title: itemTitle.trim() }) })
    if (!res.ok) return
    const { data } = await res.json()
    setChecklists(v => v.map(c => c.id === checklistId ? { ...c, items: [...c.items, data] } : c))
    setItemTitle('')
  }

  async function toggleItem(checklistId: number, itemId: number, checked: boolean) {
    await fetch(`/api/checklist-items/${itemId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checked: !checked }) })
    setChecklists(v => v.map(c => c.id === checklistId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, checked: !checked } : i) } : c))
  }

  async function removeItem(checklistId: number, itemId: number) {
    await fetch(`/api/checklist-items/${itemId}`, { method: 'DELETE' })
    setChecklists(v => v.map(c => c.id === checklistId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c))
  }

  async function saveItemEdit(itemId: number, checklistId: number) {
    await fetch(`/api/checklist-items/${itemId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: editDesc, dueDate: editDue || null }) })
    setChecklists(v => v.map(c => c.id === checklistId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, description: editDesc, dueDate: editDue || null } : i) } : c))
    setEditingItem(null)
  }

  function startEditItem(item: ChecklistItem) {
    setEditingItem(item.id)
    setEditDesc(item.description)
    setEditDue(item.dueDate ?? '')
  }

  return (
    <section className="mt-5 border-t border-border pt-5">
      {checklists.map(cl => {
        const total = cl.items.length
        const checked = cl.items.filter(i => i.checked).length
        const pct = total ? Math.round(checked / total * 100) : 0
        return (
          <div key={cl.id} className="mb-6 last:mb-0">
            <div className="mb-3 flex items-center justify-between">
              {editingChecklist === cl.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input value={checklistTitleForm} onChange={e => setChecklistTitleForm(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void saveChecklistTitle(cl.id); if (e.key === 'Escape') setEditingChecklist(null) }} className="flex-1 rounded-sm border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary" autoFocus />
                  <button onClick={() => void saveChecklistTitle(cl.id)} className="rounded-sm bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">Guardar</button>
                  <button onClick={() => setEditingChecklist(null)} className="rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-secondary">Cancelar</button>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-semibold">{cl.title}</h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingChecklist(cl.id); setChecklistTitleForm(cl.title) }} className="rounded p-1 text-muted-foreground/50 hover:text-primary" aria-label="Editar checklist"><Pencil className="size-3.5" /></button>
                    <button onClick={() => removeChecklist(cl.id)} className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Eliminar checklist"><Trash2 className="size-3.5" /></button>
                  </div>
                </>
              )}
            </div>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{pct}%</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-border"><div className="h-full rounded-sm bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
            </div>
            <div className="flex flex-col gap-1">
              {cl.items.map(item => (
                <div key={item.id}>
                  <div className="group flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-secondary/50">
                    <button onClick={() => toggleItem(cl.id, item.id, item.checked)} className={`flex size-5 shrink-0 items-center justify-center rounded border ${item.checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border hover:border-emerald-500'}`}>
                      {item.checked && <Check className="size-3" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.checked ? 'text-muted-foreground line-through' : ''}`}>{item.title}</span>
                    {item.dueDate && <span className="shrink-0 rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{new Date(item.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>}
                    <button onClick={() => startEditItem(item)} className="rounded p-1 text-muted-foreground/50 hover:text-primary" aria-label="Editar elemento"><Pencil className="size-3.5" /></button>
                    <button onClick={() => removeItem(cl.id, item.id)} className="rounded p-1 text-muted-foreground/50 hover:text-destructive" aria-label="Eliminar elemento"><Trash2 className="size-3.5" /></button>
                  </div>
                  {editingItem === item.id && (
                    <div className="ml-7 mt-1 flex flex-col gap-2 rounded-sm border border-border bg-background p-3">
                      <div className="flex flex-col gap-1"><label className="text-xs text-muted-foreground">Descripción</label><textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descripción..." className="min-h-[50px] w-full resize-none rounded-sm border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary" /></div>
                      <div className="flex flex-col gap-1"><label className="text-xs text-muted-foreground">Fecha de vencimiento</label><input type="date" value={editDue} onChange={e => setEditDue(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary" /></div>
                      <div className="flex justify-end gap-2"><button onClick={() => setEditingItem(null)} className="rounded-sm px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"><X className="size-3" /> Cancelar</button><button onClick={() => void saveItemEdit(item.id, cl.id)} className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Guardar</button></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {addingItemTo === cl.id ? (
              <div className="mt-2 flex items-center gap-2">
                <input value={itemTitle} onChange={e => setItemTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { void addItem(cl.id); setAddingItemTo(null) } if (e.key === 'Escape') setAddingItemTo(null) }} placeholder="Elemento..." className="flex-1 rounded-sm border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" autoFocus />
                <button onClick={() => { void addItem(cl.id); setAddingItemTo(null) }} className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Añadir</button>
                <button onClick={() => setAddingItemTo(null)} className="rounded-sm px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
              </div>
            ) : (
              <button onClick={() => { setAddingItemTo(cl.id); setItemTitle('') }} className="mt-2 flex items-center gap-2 rounded-sm border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50"><Plus className="size-4" /> Añadir un elemento</button>
            )}
          </div>
        )
      })}

      <div className="mt-4 flex items-center gap-2">
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void addChecklist() }} placeholder="Nuevo checklist..." className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <button onClick={addChecklist} disabled={!newTitle.trim()} className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Añadir</button>
      </div>
    </section>
  )
}
